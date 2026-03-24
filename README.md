# OpenClaw Agent for SiloCRM

OpenClaw AI agent infrastructure for SiloPilot - SiloCRM's AI assistant.

## Structure

```
├── docker/
│   └── Dockerfile          # OpenClaw container image
├── config/
│   ├── openclaw.json       # Agent settings
│   └── workspace/
│       ├── SOUL.md         # Agent personality
│       └── skills/         # MCP skill definitions
├── docker-compose.yml      # Local development
└── railway.toml            # Railway deployment config
```

## Local Development

```bash
docker-compose up
```

## Deployment

This repo is deployed via Railway. When SiloCRM provisions a new SiloPilot container:

1. Railway clones this repo
2. Builds from `docker/Dockerfile`
3. Sets environment variables (service token, API URL)
4. Deploys the container

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Container port (default: 18789) |
| `SILOCRM_API_URL` | SiloCRM API base URL |
| `SILOCRM_SERVICE_TOKEN` | Per-org service token for MCP auth |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |

## Skills

- **crm** - Lead, contact, pipeline data access via MCP
- **analytics** - Reports & KPI metrics
- **python-analysis** - Python data analysis & visualization
- **knowledge-search** - Knowledge base search (Phase 3)
- **booking** - Tasks, reminders, appointments
- **automation** - Workflows & sequences
- **frontend-actions** - UI navigation & highlighting (Phase 4)
