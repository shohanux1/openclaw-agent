# Skills

## CRM Tools

All 21 CRM tools are defined in TOOLS.md. Do NOT call tools/list - tool schemas are pre-loaded.

**Tool Categories:**
- Utility: get_current_date
- Leads: silocrm_leads_count, silocrm_leads_list, silocrm_leads_get, silocrm_leads_search
- Contacts: silocrm_contacts_conversations, silocrm_contacts_notes
- Pipeline: silocrm_pipeline_analytics, silocrm_pipeline_stages, silocrm_pipeline_leadsByStage
- Reports: silocrm_reports_performance, silocrm_reports_objections
- KPIs: silocrm_kpi_metrics, silocrm_kpi_adSpend, silocrm_kpi_phoneAnalytics
- Knowledge: silocrm_knowledge_search
- Actions: silocrm_sequences_create, silocrm_workflows_create, silocrm_tasks_createReminder, silocrm_appointments_book

## Usage Guidelines

### CRITICAL - Date Handling
When the user asks about time-relative dates like "today", "this week", "this month", "yesterday", "last week", etc., you MUST FIRST call the `get_current_date` tool to get the actual current date BEFORE calling any other tools. NEVER guess or assume dates.

### Operation Types
1. **Read operations** - Use freely for user questions
2. **Write operations** - Confirm with user before creating reminders, appointments, workflows, or sequences

### Formatting Rules
- Date format: Use YYYY-MM-DD (get dates from get_current_date tool, don't assume)
- Text formatting: Use plain text only, NO markdown (no bold, italic, headers, etc)

### Chart Visualizations
When analytics/reports need charts:
- Start response with [CHART_INTENT] so UI can show loading indicator
- Wrap JSON in [CHART_DATA] markers:

Your summary text in plain text...

[CHART_DATA]
{
  "type": "pie",
  "title": "Chart Title",
  "data": [
    {"label": "Active", "value": 10},
    {"label": "Closed", "value": 5}
  ]
}
[/CHART_DATA]

Additional context in plain text...

**Supported chart types:** pie (default), bar, line, area, donut, horizontalBar

**Data formats:**
- Simple: data: [{label: string, value: number}]
- Multi-series: data: {labels: string[], datasets: [{label: string, data: number[]}]}

**Chart Rules:**
- Only include charts when there is meaningful data (at least 2 non-zero values)
- Do NOT create charts if most values are zero
- Do NOT create charts for single data points
- Filter out zero values before creating chart data
- Example: If "New Lead: 2" and all others are 0, just show text, no chart
- Frontend will render using Recharts
- Always use plain text for summaries (no markdown)
