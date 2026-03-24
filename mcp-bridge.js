#!/usr/bin/env node
/**
 * MCP Stdio Bridge
 *
 * Bridges stdio MCP transport to HTTP MCP server.
 * OpenClaw only supports stdio MCP servers, so this script
 * proxies requests to our HTTP-based MCP endpoint.
 *
 * Usage: node mcp-bridge.js
 *
 * Environment variables:
 * - SILOCRM_API_URL: Base URL of SiloCRM API
 * - SILOCRM_SERVICE_TOKEN: Service token for authentication
 */

const readline = require('readline');
const https = require('https');
const http = require('http');

const API_URL = process.env.SILOCRM_API_URL;
const SERVICE_TOKEN = process.env.SILOCRM_SERVICE_TOKEN;

if (!API_URL || !SERVICE_TOKEN) {
  console.error(JSON.stringify({
    jsonrpc: '2.0',
    id: null,
    error: {
      code: -32603,
      message: 'Missing SILOCRM_API_URL or SILOCRM_SERVICE_TOKEN environment variables'
    }
  }));
  process.exit(1);
}

const MCP_ENDPOINT = `${API_URL}/api/mcp`;

/**
 * Send request to HTTP MCP server
 */
async function sendToMcpServer(request) {
  return new Promise((resolve, reject) => {
    const url = new URL(MCP_ENDPOINT);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_TOKEN}`,
        'ngrok-skip-browser-warning': 'true'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(request));
    req.end();
  });
}

/**
 * Handle incoming MCP request
 */
async function handleRequest(line) {
  try {
    const request = JSON.parse(line);

    // Log to stderr for debugging (stdout is reserved for MCP responses)
    console.error(`[mcp-bridge] Received: ${request.method}`);

    const response = await sendToMcpServer(request);

    console.error(`[mcp-bridge] Response for ${request.method}: success=${!!response.result}`);

    // Send response to stdout
    console.log(JSON.stringify(response));
  } catch (error) {
    console.error(`[mcp-bridge] Error: ${error.message}`);

    // Try to parse request ID for error response
    let id = null;
    try {
      id = JSON.parse(line).id;
    } catch {}

    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: error.message
      }
    }));
  }
}

// Set up readline for stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

console.error(`[mcp-bridge] Started. Endpoint: ${MCP_ENDPOINT}`);

rl.on('line', handleRequest);

rl.on('close', () => {
  console.error('[mcp-bridge] Stdin closed, exiting');
  process.exit(0);
});

// Handle process signals
process.on('SIGTERM', () => {
  console.error('[mcp-bridge] SIGTERM received, exiting');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.error('[mcp-bridge] SIGINT received, exiting');
  process.exit(0);
});
