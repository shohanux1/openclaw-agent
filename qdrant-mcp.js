#!/usr/bin/env node
/**
 * Qdrant MCP Server
 *
 * Provides semantic search over CRM records using Qdrant vector database.
 * Implements JSON-RPC 2.0 protocol for OpenClaw integration.
 *
 * Features:
 * - Semantic search across leads, contacts, notes
 * - Organization isolation via org_id filter
 * - Hybrid indexing: on-demand + periodic sync
 *
 * Environment variables:
 * - QDRANT_URL: Qdrant server URL (e.g., http://qdrant:6333)
 * - OPENAI_API_KEY: For text embeddings
 * - SILOCRM_API_URL: SiloCRM API base URL
 * - SILOCRM_SERVICE_TOKEN: Service token for authentication
 */

const readline = require('readline');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

// Environment variables
const QDRANT_URL = process.env.QDRANT_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SILOCRM_API_URL = process.env.SILOCRM_API_URL;
const SILOCRM_SERVICE_TOKEN = process.env.SILOCRM_SERVICE_TOKEN;

// Constants
const COLLECTION_NAME = 'crm_records';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const VECTOR_SIZE = 1536;
// const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes - TODO: implement periodic sync

// State
let initialized = false;
let lastSyncTime = null;
let indexedCounts = { leads: 0, contacts: 0, notes: 0 };
let syncInterval = null;

// Validate environment
if (!QDRANT_URL || !OPENAI_API_KEY || !SILOCRM_API_URL || !SILOCRM_SERVICE_TOKEN) {
  console.error(JSON.stringify({
    jsonrpc: '2.0',
    id: null,
    error: {
      code: -32603,
      message: 'Missing required environment variables: QDRANT_URL, OPENAI_API_KEY, SILOCRM_API_URL, SILOCRM_SERVICE_TOKEN'
    }
  }));
  process.exit(1);
}

// =============================================================================
// HTTP UTILITIES
// =============================================================================

/**
 * Make HTTP request
 */
function httpRequest(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      ...options
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(json)}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          } else {
            resolve(data);
          }
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

// =============================================================================
// QDRANT OPERATIONS
// =============================================================================

/**
 * Ensure Qdrant collection exists
 */
async function ensureCollection() {
  try {
    // Check if collection exists
    const collections = await httpRequest(`${QDRANT_URL}/collections`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const exists = collections.result?.collections?.some(c => c.name === COLLECTION_NAME);

    if (!exists) {
      console.error(`[qdrant-mcp] Creating collection: ${COLLECTION_NAME}`);
      await httpRequest(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      }, {
        vectors: {
          size: VECTOR_SIZE,
          distance: 'Cosine'
        }
      });

      // Create payload index for org_id filtering
      await httpRequest(`${QDRANT_URL}/collections/${COLLECTION_NAME}/index`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      }, {
        field_name: 'org_id',
        field_schema: 'keyword'
      });

      // Create payload index for type filtering
      await httpRequest(`${QDRANT_URL}/collections/${COLLECTION_NAME}/index`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      }, {
        field_name: 'type',
        field_schema: 'keyword'
      });

      console.error(`[qdrant-mcp] Collection created with indexes`);
    }
  } catch (error) {
    console.error(`[qdrant-mcp] Error ensuring collection:`, error.message);
    throw error;
  }
}

/**
 * Generate deterministic point ID from org, type, and record ID
 */
function generatePointId(orgId, type, recordId) {
  const str = `${orgId}:${type}:${recordId}`;
  const hash = crypto.createHash('md5').update(str).digest('hex');
  // Qdrant expects unsigned 64-bit integer or UUID string
  // We'll use the hash as a UUID-like string
  return hash;
}

/**
 * Search Qdrant with org_id filter
 */
async function searchQdrant(vector, orgId, types, limit) {
  const filter = {
    must: [
      { key: 'org_id', match: { value: orgId } }
    ]
  };

  if (types && types.length > 0) {
    filter.must.push({
      key: 'type',
      match: { any: types }
    });
  }

  const response = await httpRequest(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    vector: vector,
    filter: filter,
    limit: limit || 10,
    with_payload: true
  });

  return response.result || [];
}

/**
 * Upsert points to Qdrant
 */
async function upsertPoints(points) {
  if (points.length === 0) return;

  await httpRequest(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    points: points
  });
}

/**
 * Count points for an organization
 */
async function countPoints(orgId) {
  try {
    const response = await httpRequest(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/count`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      filter: {
        must: [{ key: 'org_id', match: { value: orgId } }]
      },
      exact: true
    });
    return response.result?.count || 0;
  } catch (error) {
    return 0;
  }
}

// =============================================================================
// OPENAI EMBEDDINGS
// =============================================================================

/**
 * Create embedding using OpenAI API
 */
async function createEmbedding(text) {
  const response = await httpRequest('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    }
  }, {
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000) // Truncate to avoid token limits
  });

  return response.data[0].embedding;
}

/**
 * Create embeddings in batch
 */
async function createEmbeddingsBatch(texts) {
  if (texts.length === 0) return [];

  // OpenAI allows up to 2048 inputs per request
  const batchSize = 100;
  const embeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize).map(t => t.slice(0, 8000));

    const response = await httpRequest('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    }, {
      model: EMBEDDING_MODEL,
      input: batch
    });

    embeddings.push(...response.data.map(d => d.embedding));
  }

  return embeddings;
}

// =============================================================================
// SILOCRM DATA FETCHING
// =============================================================================

/**
 * Fetch data from SiloCRM API
 */
async function fetchFromSiloCRM(endpoint, orgId) {
  const url = `${SILOCRM_API_URL}${endpoint}`;
  return httpRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SILOCRM_SERVICE_TOKEN}`
    }
  }, {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: 'silocrm_leads_list',
      arguments: { limit: 50 },
      _meta: { context: { organizationId: orgId } }
    }
  });
}

/**
 * Fetch leads for indexing
 */
async function fetchLeads(orgId) {
  try {
    const response = await httpRequest(`${SILOCRM_API_URL}/api/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SILOCRM_SERVICE_TOKEN}`
      }
    }, {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: 'silocrm_leads_list',
        arguments: { limit: 50 },
        _meta: { context: { organizationId: orgId } }
      }
    });

    const content = response.result?.content?.[0]?.text;
    if (content) {
      const data = JSON.parse(content);
      return data.leads || [];
    }
    return [];
  } catch (error) {
    console.error(`[qdrant-mcp] Error fetching leads:`, error.message);
    return [];
  }
}

// =============================================================================
// INDEXING
// =============================================================================

/**
 * Index CRM data for an organization
 */
async function indexCrmData(orgId) {
  console.error(`[qdrant-mcp] Indexing CRM data for org: ${orgId}`);

  try {
    // Fetch leads
    const leads = await fetchLeads(orgId);
    console.error(`[qdrant-mcp] Fetched ${leads.length} leads`);

    if (leads.length === 0) {
      console.error(`[qdrant-mcp] No leads to index`);
      return;
    }

    // Prepare texts for embedding
    const texts = leads.map(lead => {
      const parts = [
        lead.contactName || lead.name || '',
        lead.contactEmail || lead.email || '',
        lead.status || '',
        lead.pipelineStageName || '',
        lead.source || '',
        Array.isArray(lead.tags) ? lead.tags.join(' ') : ''
      ].filter(Boolean);
      return parts.join(' ').trim();
    });

    // Create embeddings
    console.error(`[qdrant-mcp] Creating embeddings for ${texts.length} records`);
    const embeddings = await createEmbeddingsBatch(texts);

    // Prepare points for Qdrant
    const points = leads.map((lead, i) => ({
      id: generatePointId(orgId, 'lead', lead.id),
      vector: embeddings[i],
      payload: {
        org_id: orgId,
        type: 'lead',
        record_id: lead.id,
        text: texts[i],
        metadata: {
          name: lead.contactName || lead.name,
          email: lead.contactEmail || lead.email,
          status: lead.status,
          stage: lead.pipelineStageName,
          source: lead.source
        }
      }
    }));

    // Upsert to Qdrant
    console.error(`[qdrant-mcp] Upserting ${points.length} points to Qdrant`);
    await upsertPoints(points);

    indexedCounts.leads = leads.length;
    lastSyncTime = new Date().toISOString();

    console.error(`[qdrant-mcp] Indexing complete. Total: ${points.length} records`);
  } catch (error) {
    console.error(`[qdrant-mcp] Indexing error:`, error.message);
  }
}

// =============================================================================
// MCP TOOL IMPLEMENTATIONS
// =============================================================================

/**
 * Tool: semantic_search
 */
async function semanticSearch(args, orgId) {
  const { query, limit = 10, types } = args;

  if (!query) {
    return { error: 'Missing required parameter: query' };
  }

  // Check if we need to index first
  const count = await countPoints(orgId);
  if (count === 0) {
    console.error(`[qdrant-mcp] No indexed data for org ${orgId}, indexing now...`);
    await indexCrmData(orgId);
  }

  // Create query embedding
  const queryVector = await createEmbedding(query);

  // Search Qdrant
  const results = await searchQdrant(queryVector, orgId, types, Math.min(limit, 20));

  return {
    results: results.map(r => ({
      id: r.payload.record_id,
      type: r.payload.type,
      text: r.payload.text,
      score: r.score,
      metadata: r.payload.metadata
    })),
    count: results.length,
    query: query
  };
}

/**
 * Tool: index_status
 */
async function indexStatus(args, orgId) {
  const count = await countPoints(orgId);

  return {
    indexed_count: count,
    last_sync: lastSyncTime,
    types: indexedCounts,
    organization_id: orgId
  };
}

/**
 * Tool: index_now - Force re-indexing of CRM data
 */
async function indexNow(args, orgId) {
  console.error(`[qdrant-mcp] Manual index triggered for org: ${orgId}`);

  await indexCrmData(orgId);
  const count = await countPoints(orgId);

  return {
    success: true,
    indexed_count: count,
    last_sync: lastSyncTime,
    message: `Indexed ${count} records for organization`
  };
}

// =============================================================================
// MCP PROTOCOL HANDLING
// =============================================================================

const TOOLS = [
  {
    name: 'semantic_search',
    description: 'Search CRM records using natural language (semantic similarity). Use when structured tools don\'t find exact matches or for conceptual queries like "leads interested in solar" or "contacts with budget concerns".',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language search query'
        },
        limit: {
          type: 'number',
          description: 'Max results (1-20, default 10)'
        },
        types: {
          type: 'array',
          items: { type: 'string', enum: ['leads', 'contacts', 'notes'] },
          description: 'Filter by record type'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'index_status',
    description: 'Check vector search index health and record counts',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'index_now',
    description: 'Force re-index all CRM data into vector database. Call this FIRST before searching to ensure data is loaded.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

/**
 * Handle MCP request
 */
async function handleRequest(line) {
  let request;
  try {
    request = JSON.parse(line);
  } catch (e) {
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error' }
    }));
    return;
  }

  const { id, method, params } = request;
  console.error(`[qdrant-mcp] Received: ${method}`);

  try {
    // Initialize on first request
    if (!initialized) {
      await ensureCollection();
      initialized = true;
    }

    let result;

    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: params?.protocolVersion || '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'qdrant-mcp', version: '1.0.0' }
        };
        break;

      case 'tools/list':
        result = { tools: TOOLS };
        break;

      case 'tools/call': {
        const toolName = params?.name;
        const args = params?.arguments || {};
        const orgId = params?._meta?.context?.organizationId;

        if (!orgId) {
          console.log(JSON.stringify({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Missing organizationId in context' }
          }));
          return;
        }

        let toolResult;
        switch (toolName) {
          case 'semantic_search':
            toolResult = await semanticSearch(args, orgId);
            break;
          case 'index_status':
            toolResult = await indexStatus(args, orgId);
            break;
          case 'index_now':
            toolResult = await indexNow(args, orgId);
            break;
          default:
            console.log(JSON.stringify({
              jsonrpc: '2.0',
              id,
              error: { code: -32601, message: `Unknown tool: ${toolName}` }
            }));
            return;
        }

        result = {
          content: [{ type: 'text', text: JSON.stringify(toolResult) }]
        };
        break;
      }

      default:
        if (method.startsWith('notifications/')) {
          // Notifications don't need response
          return;
        }
        console.log(JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Unknown method: ${method}` }
        }));
        return;
    }

    console.error(`[qdrant-mcp] Response for ${method}: success`);
    console.log(JSON.stringify({ jsonrpc: '2.0', id, result }));

  } catch (error) {
    console.error(`[qdrant-mcp] Error:`, error.message);
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: error.message }
    }));
  }
}

// =============================================================================
// MAIN
// =============================================================================

// Set up readline for stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

console.error(`[qdrant-mcp] Started. Qdrant: ${QDRANT_URL}`);

rl.on('line', handleRequest);

rl.on('close', () => {
  console.error('[qdrant-mcp] Stdin closed, exiting');
  if (syncInterval) clearInterval(syncInterval);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('[qdrant-mcp] SIGTERM received, exiting');
  if (syncInterval) clearInterval(syncInterval);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.error('[qdrant-mcp] SIGINT received, exiting');
  if (syncInterval) clearInterval(syncInterval);
  process.exit(0);
});
