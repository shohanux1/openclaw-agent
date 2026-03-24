# CRM Data Access

Access lead, contact, and pipeline data from SiloCRM.

## Tools

Uses MCP tools from `silocrm` server:

### Leads
- `silocrm.leads.count` - Count leads by date range, status
- `silocrm.leads.list` - List leads with filters (up to 50)
- `silocrm.leads.get` - Get lead details by ID
- `silocrm.leads.search` - Search leads by name

### Contacts
- `silocrm.contacts.conversations` - SMS, email, voice history
- `silocrm.contacts.notes` - Contact notes

### Pipeline
- `silocrm.pipeline.analytics` - Stage distribution, projections
- `silocrm.pipeline.stages` - List available stages
- `silocrm.pipeline.leadsByStage` - Leads in specific stage

## Usage

When users ask about leads, contacts, or pipeline:
1. Use appropriate MCP tool to fetch data
2. Format results clearly
3. Generate visualizations for data
4. Offer actionable insights
