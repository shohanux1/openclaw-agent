# Skills

## CRM Tools

**Tool Categories:**
- Search: semantic_search (via Qdrant - all read operations)
- Actions: silocrm_sequences_create, silocrm_workflows_create, silocrm_tasks_createReminder, silocrm_appointments_book

## Usage Guidelines

### Search Operations
Use `semantic_search` for ALL data queries:
- "Find leads who mentioned budget concerns"
- "Show contacts interested in enterprise plans"
- "Any leads worried about installation time"
- "Leads in Texas"
- "Messages about pricing"

**Best Practices:**
1. Use descriptive, natural language queries
2. Specify types filter if you only need leads, notes, messages, or calls
3. Results include similarity scores - higher is better match

### Write Operations
Confirm with user before creating:
- Reminders/tasks
- Appointments
- Workflows
- Message sequences

### Formatting Rules
- **Text formatting:** Use plain text only, NO markdown (no bold, italic, headers, bullets, etc)
- **Date format:** Use YYYY-MM-DD format

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
