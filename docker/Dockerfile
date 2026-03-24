# OpenClaw Provision - Using official pre-built image from GHCR
FROM ghcr.io/openclaw/openclaw:main

# Set environment variables
ENV OPENCLAW_HOME=/home/node/.openclaw
ENV OPENCLAW_STATE_DIR=/home/node/.openclaw
ENV OPENCLAW_WORKSPACE_DIR=/home/node/.openclaw/workspace
ENV OPENCLAW_GATEWAY_PORT=18789
ENV OPENCLAW_GATEWAY_TOKEN=openclaw-provision-test-token
ENV OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=true
ENV OPENCLAW_GATEWAY_BIND=lan

# Create OpenClaw directories
USER root
RUN mkdir -p /home/node/.openclaw/workspaces/main && \
    chown -R node:node /home/node/.openclaw

# Copy pre-configured files
COPY --chown=node:node config/openclaw.json /home/node/.openclaw/openclaw.json
COPY --chown=node:node config/workspace/ /home/node/.openclaw/workspaces/main/

# Copy MCP bridge script (stdio to HTTP proxy)
COPY --chown=node:node mcp-bridge.js /home/node/.openclaw/mcp-bridge.js

USER node

# Expose the gateway port
EXPOSE 18789

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -fsS http://localhost:18789/healthz || exit 1

# Start OpenClaw Gateway
CMD ["openclaw", "gateway", "run", "--allow-unconfigured", "--bind", "lan"]
