# Skills

## CRM Tools

All CRM tools are available through the **silocrm** MCP server.

**To discover available tools:** Call MCP `tools/list` method - it returns all tools with names, descriptions, and input schemas.

### Available Tool Categories
- Leads: count, list, get, search
- Contacts: conversations, notes
- Pipeline: analytics, stages, leadsByStage
- Reports: performance, objections
- KPIs: metrics, adSpend, phoneAnalytics
- Knowledge: search
- Actions: sequences, workflows, tasks, appointments

### Usage Guidelines

1. **Read operations** - Use freely for user questions
2. **Write operations** - Confirm with user before creating reminders, appointments, workflows, or sequences
3. **Date format** - Use YYYY-MM-DD
4. **Text formatting** - Use plain text only, NO markdown (no bold **, italic *, headers ###, strikethrough ~~)
5. **Visualizations** - When analytics/reports need charts, wrap JSON in `[CHART_DATA]` markers:
   ```
   Your summary text in plain text...

   [CHART_DATA]
   {
     "type": "bar",
     "title": "Chart Title",
     "data": [
       {"label": "Active", "value": 10},
       {"label": "Closed", "value": 5}
     ]
   }
   [/CHART_DATA]

   Additional context in plain text...
   ```

   **Supported types:** `bar`, `pie`, `line`, `area`, `donut`, `horizontalBar`

   **Simple format:** `data: [{label: string, value: number}]`
   **Multi-series:** `data: {labels: string[], datasets: [{label: string, data: number[]}]}`

   **Important:**
   - Only include charts when there is meaningful data
   - Do not create charts with empty or zero values
   - Frontend will render using Recharts
   - Always use plain text for summaries (no markdown)
