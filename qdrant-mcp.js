#!/usr/bin/env node
/**
 * Qdrant MCP Server (Search Only)
 *
 * Provides semantic search over CRM records using Qdrant vector database.
 * Indexing is handled by SiloCRM backend - this server only queries.
 *
 * Environment variables:
 * - QDRANT_URL: Qdrant server URL
 * - QDRANT_API_KEY: Qdrant API key for authentication (optional)
 * - OPENAI_API_KEY: For query embeddings
 * - SILOCRM_ORG_ID: Organization ID for filtering
 */

const readline = require('readline');
const https = require('https');
const http = require('http');

// Environment variables
const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SILOCRM_ORG_ID = process.env.SILOCRM_ORG_ID;

// Constants
const COLLECTION_NAME = 'crm_records';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const MIN_SCORE_THRESHOLD = 0.75; // Only return results with 75%+ similarity (exact/highly relevant matches)

// Validate environment
if (!QDRANT_URL || !OPENAI_API_KEY) {
  console.error(JSON.stringify({
    jsonrpc: '2.0',
    id: null,
    error: {
      code: -32603,
      message: 'Missing required environment variables: QDRANT_URL, OPENAI_API_KEY'
    }
  }));
  process.exit(1);
}

// =============================================================================
// HTTP UTILITIES
// =============================================================================

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
// OPENAI EMBEDDINGS
// =============================================================================

async function createEmbedding(text) {
  const response = await httpRequest('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    }
  }, {
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000)
  });

  return response.data[0].embedding;
}

// =============================================================================
// QDRANT SEARCH
// =============================================================================

async function searchQdrant(vector, orgId, types, limit, filters) {
  const filter = {
    must: [
      { key: 'org_id', match: { value: orgId } }
    ]
  };

  // Type filter (lead, note, message, call)
  if (types && types.length > 0) {
    filter.must.push({
      key: 'type',
      match: { any: types }
    });
  }

  // Exact field filters
  if (filters) {
    if (filters.status) {
      filter.must.push({ key: 'status', match: { value: filters.status } });
    }
    if (filters.stage) {
      filter.must.push({ key: 'stage', match: { value: filters.stage } });
    }
    if (filters.email) {
      filter.must.push({ key: 'email', match: { value: filters.email } });
    }
    if (filters.name) {
      filter.must.push({ key: 'name', match: { value: filters.name } });
    }
    if (filters.pipeline) {
      filter.must.push({ key: 'pipeline', match: { value: filters.pipeline } });
    }
    if (filters.source) {
      filter.must.push({ key: 'source', match: { value: filters.source } });
    }
    // Assignment filters
    if (filters.assigned_to) {
      filter.must.push({ key: 'assigned_to', match: { value: filters.assigned_to } });
    }
    if (filters.unassigned === true) {
      filter.must.push({ key: 'assigned_to', match: { value: null } });
    }
    // Archive filter
    if (filters.is_archived !== undefined) {
      filter.must.push({ key: 'is_archived', match: { value: filters.is_archived } });
    }
    // Date range filters (created_at, updated_at)
    if (filters.created_after) {
      filter.must.push({ key: 'created_at', range: { gte: filters.created_after } });
    }
    if (filters.created_before) {
      filter.must.push({ key: 'created_at', range: { lt: filters.created_before } });
    }
    if (filters.updated_after) {
      filter.must.push({ key: 'updated_at', range: { gte: filters.updated_after } });
    }
    if (filters.last_contacted_before) {
      filter.must.push({ key: 'last_contacted_at', range: { lt: filters.last_contacted_before } });
    }
  }

  const headers = { 'Content-Type': 'application/json' };
  if (QDRANT_API_KEY) {
    headers['api-key'] = QDRANT_API_KEY;
  }

  const response = await httpRequest(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/search`, {
    method: 'POST',
    headers: headers
  }, {
    vector: vector,
    filter: filter,
    limit: limit || 10,
    with_payload: true,
    score_threshold: MIN_SCORE_THRESHOLD
  });

  return response.result || [];
}

async function countPoints(orgId) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (QDRANT_API_KEY) {
      headers['api-key'] = QDRANT_API_KEY;
    }

    const response = await httpRequest(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/count`, {
      method: 'POST',
      headers: headers
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
// MCP TOOL IMPLEMENTATION
// =============================================================================

async function semanticSearch(args, orgId) {
  const { query, limit = 10, types, filters } = args;

  if (!query) {
    return { error: 'Missing required parameter: query' };
  }

  // Check if data exists for this org
  const count = await countPoints(orgId);
  if (count === 0) {
    return {
      error: 'No indexed data found. Please enable SiloPilot to sync data.',
      results: [],
      count: 0
    };
  }

  // Create query embedding
  const queryVector = await createEmbedding(query);

  // Search Qdrant with optional exact filters
  const results = await searchQdrant(queryVector, orgId, types, Math.min(limit, 20), filters);

  return {
    results: results.map(r => ({
      id: r.payload.record_id,
      type: r.payload.type,
      text: r.payload.text,
      score: r.score,
      metadata: {
        name: r.payload.name,
        email: r.payload.email,
        phone: r.payload.phone,
        status: r.payload.status,
        stage: r.payload.stage,
        pipeline: r.payload.pipeline,
        source: r.payload.source,
        contact_name: r.payload.contact_name
      }
    })),
    count: results.length,
    query: query,
    filters: filters || null
  };
}

// =============================================================================
// MCP PROTOCOL
// =============================================================================

const TOOLS = [
  {
    name: 'semantic_search',
    description: 'Search CRM records using natural language with optional exact filters. Use query for semantic matching, add filters for exact field matches.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language search query (for semantic similarity)'
        },
        limit: {
          type: 'number',
          description: 'Max results (1-20, default 10)'
        },
        types: {
          type: 'array',
          items: { type: 'string', enum: ['lead', 'note', 'message', 'call'] },
          description: 'Filter by record type'
        },
        filters: {
          type: 'object',
          description: 'Exact field filters (optional). Use for precise matching and time-based queries.',
          properties: {
            // Basic filters
            status: { type: 'string', description: 'Exact status match (e.g., "New Lead", "Contacted", "Won")' },
            stage: { type: 'string', description: 'Exact pipeline stage match' },
            email: { type: 'string', description: 'Exact email match' },
            name: { type: 'string', description: 'Exact name match' },
            pipeline: { type: 'string', description: 'Exact pipeline name match' },
            source: { type: 'string', description: 'Exact lead source match' },
            // Assignment filters
            assigned_to: { type: 'string', description: 'Filter by assigned user ID' },
            unassigned: { type: 'boolean', description: 'Filter for unassigned leads (true)' },
            // Archive filter
            is_archived: { type: 'boolean', description: 'Filter archived leads (true) or active (false)' },
            // Date range filters (ISO 8601 format)
            created_after: { type: 'string', description: 'Created after date (YYYY-MM-DD or ISO 8601)' },
            created_before: { type: 'string', description: 'Created before date (YYYY-MM-DD or ISO 8601)' },
            updated_after: { type: 'string', description: 'Updated after date (YYYY-MM-DD or ISO 8601)' },
            last_contacted_before: { type: 'string', description: 'Last contacted before date (for follow-up queries)' }
          }
        }
      },
      required: ['query']
    }
  }
];

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
    let result;

    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: params?.protocolVersion || '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'qdrant-mcp', version: '2.0.0' }
        };
        break;

      case 'tools/list':
        result = { tools: TOOLS };
        break;

      case 'tools/call': {
        const toolName = params?.name;
        const args = params?.arguments || {};
        const orgId = params?._meta?.context?.organizationId || SILOCRM_ORG_ID;

        if (!orgId) {
          console.log(JSON.stringify({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Missing organizationId in context' }
          }));
          return;
        }

        let toolResult;
        if (toolName === 'semantic_search') {
          toolResult = await semanticSearch(args, orgId);
        } else {
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

console.error(`[qdrant-mcp] Started (search-only). Qdrant: ${QDRANT_URL}`);

rl.on('line', handleRequest);

rl.on('close', () => {
  console.error('[qdrant-mcp] Stdin closed, exiting');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('[qdrant-mcp] SIGTERM received, exiting');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.error('[qdrant-mcp] SIGINT received, exiting');
  process.exit(0);
});
