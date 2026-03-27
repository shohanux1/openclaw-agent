Skills

CRM Tools

All CRM tools are available through the silocrm MCP server.

To discover available tools: Call MCP tools/list method - it returns all tools with names, descriptions, and input schemas.

Available Tool Categories:
- Leads: count, list, get, search
- Contacts: conversations, notes
- Pipeline: analytics, stages, leadsByStage
- Reports: performance, objections
- KPIs: metrics, adSpend, phoneAnalytics
- Knowledge: search
- Actions: sequences, workflows, tasks, appointments

Usage Guidelines:

CRITICAL - Date Handling:
When the user asks about time-relative dates like "today", "this week", "this month", "yesterday", "last week", etc., you MUST FIRST call the `get_current_date` tool to get the actual current date BEFORE calling any other tools. NEVER guess or assume dates. The tool returns today's date and pre-calculated date ranges for "this week" and "this month".

1. Read operations - Use freely for user questions
2. Write operations - Confirm with user before creating reminders, appointments, workflows, or sequences
3. Date format - Use YYYY-MM-DD (get dates from get_current_date tool, don't assume)
4. Text formatting - Use plain text only, NO markdown (no bold, italic, headers, etc)
5. Visualizations - When analytics/reports need charts:
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

   Supported types: pie (default), bar, line, area, donut, horizontalBar

   Simple format: data: [{label: string, value: number}]
   Multi-series: data: {labels: string[], datasets: [{label: string, data: number[]}]}

   Important:
   - Only include charts when there is meaningful data (at least 2 non-zero values)
   - Do NOT create charts if most values are zero
   - Do NOT create charts for single data points
   - Filter out zero values before creating chart data
   - Example: If "New Lead: 2" and all others are 0, just show text, no chart
   - Frontend will render using Recharts
   - Always use plain text for summaries (no markdown)
