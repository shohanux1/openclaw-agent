# Skills

## CRM Tools

**Tool Categories:**
- Utility: get_current_date
- Pipeline Analytics: silocrm_pipeline_analytics, silocrm_pipeline_stages, silocrm_pipeline_leadsByStage
- Reports: silocrm_reports_performance, silocrm_reports_objections
- KPI Metrics: silocrm_kpi_metrics, silocrm_kpi_adSpend, silocrm_kpi_phoneAnalytics
- Search: semantic_search (via Qdrant - for finding specific records)
- Actions: silocrm_sequences_create, silocrm_workflows_create, silocrm_tasks_createReminder, silocrm_appointments_book

## Usage Guidelines

### CRITICAL - Date Handling
When the user asks about time-relative dates like "today", "this week", "this month", "yesterday", "last week", etc., you MUST FIRST call the `get_current_date` tool to get the actual current date BEFORE calling any other tools. NEVER guess or assume dates.

### Pipeline Analytics
Use pipeline tools for stage analysis and lead distribution:
- `silocrm_pipeline_analytics` - Overall pipeline metrics with chart data (date range required)
- `silocrm_pipeline_stages` - List all available pipeline stages
- `silocrm_pipeline_leadsByStage` - Get leads in a specific stage (with optional filters)

**Examples:**
- "Show me my pipeline" → get_current_date, then silocrm_pipeline_analytics
- "What pipeline stages do we have?" → silocrm_pipeline_stages
- "Leads stuck in Demo stage" → silocrm_pipeline_leadsByStage with minDaysInStage filter

### Reports & KPI
Use reporting and KPI tools for business metrics:
- `silocrm_reports_performance` - Comprehensive performance metrics report
- `silocrm_reports_objections` - Analyze objections from notes and calls
- `silocrm_kpi_metrics` - KPIs like CPL, CPA, deals closed, best platform
- `silocrm_kpi_adSpend` - Advertising spend data by platform
- `silocrm_kpi_phoneAnalytics` - Phone call analytics and conversions

**Examples:**
- "Weekly performance report" → get_current_date, then silocrm_reports_performance
- "Cost per lead this month" → get_current_date, then silocrm_kpi_metrics
- "Ad spend by platform" → get_current_date, then silocrm_kpi_adSpend

All analytics tools return chart data when applicable. Include charts using [CHART_DATA] markers.

### Search Operations (for finding specific records)
Use `semantic_search` for finding specific records by content:
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
- Text formatting: Use plain text only, NO markdown (no bold, italic, headers, bullets, etc)
- Date format: Use YYYY-MM-DD format (get dates from get_current_date tool, don't assume)

### Chart Visualizations
When using silocrm_pipeline_analytics, the tool returns chart data. You MUST format it as:
- Start response with [CHART_INTENT] so UI can show loading indicator
- Wrap JSON in [CHART_DATA] markers
- **CRITICAL: ALWAYS include closing [/CHART_DATA] tag**

Your summary text in plain text...

[CHART_DATA]
{"type":"pie","title":"Chart Title","data":[{"label":"Active","value":10},{"label":"Closed","value":5}]}
[/CHART_DATA]

Additional context in plain text...

**Supported chart types:** pie (default), bar, line, area, donut, horizontalBar

**Data formats:**
- Simple: data: [{label: string, value: number}] or [{name: string, value: number}]
- Multi-series: data: {labels: string[], datasets: [{label: string, data: number[]}]}

**CRITICAL CHART RULES - MUST FOLLOW:**
1. **ALWAYS include closing tag**: Every [CHART_DATA] MUST have a matching [/CHART_DATA]
2. **Minimum 2 data points**: NEVER create charts with only 1 data point
3. **Filter zero values**: Remove data points with value = 0 before creating chart
4. **Valid JSON**: Chart data must be valid, single-line JSON (no line breaks)

**When to include charts:**
- 2+ stages/categories with non-zero values
- Distribution or comparison visualizations

**When NOT to include charts (use text only):**
- Only 1 data point (e.g., "Active: 2, all others: 0")
- Most values are zero
- All values are the same

**Example (1 data point - NO CHART):**
You have 2 leads, both in the Active stage. Since there's only one stage, there's no distribution to visualize.
