# Tools

## MCP Server: silocrm

CRM tools available via MCP connection. All tools use underscore naming format.

### Lead Management
- `silocrm_leads_count` - Count leads by date range and status
- `silocrm_leads_list` - List leads with filters (up to 50)
- `silocrm_leads_get` - Get detailed lead information by ID
- `silocrm_leads_search` - Search leads by first/last name

### Contact Management
- `silocrm_contacts_conversations` - Get conversation history (SMS, email, voice)
- `silocrm_contacts_notes` - Get notes for a contact

### Pipeline Analytics
- `silocrm_pipeline_analytics` - Get pipeline analytics with stage distribution
- `silocrm_pipeline_stages` - List all available pipeline stages
- `silocrm_pipeline_leadsByStage` - Get leads in a specific pipeline stage

### Reports
- `silocrm_reports_performance` - Generate performance metrics report
- `silocrm_reports_objections` - Analyze objections from notes and calls

### KPI Metrics
- `silocrm_kpi_metrics` - Get KPI metrics (CPL, CPA, deals closed, best platform)
- `silocrm_kpi_adSpend` - Get advertising spend data by platform
- `silocrm_kpi_phoneAnalytics` - Get phone call analytics

### Knowledge Base
- `silocrm_knowledge_search` - Search knowledge base documents and CRM data

### Automation
- `silocrm_sequences_create` - Create follow-up message sequences
- `silocrm_workflows_create` - Create automation workflows (saved as INACTIVE)

### Actions
- `silocrm_tasks_createReminder` - Create reminders and tasks
- `silocrm_appointments_book` - Book appointments with contacts
