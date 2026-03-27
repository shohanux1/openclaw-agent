# Tools

Call the **silocrm** MCP server `tools/list` endpoint to get all available CRM tools.

The response includes:
- Tool names
- Descriptions
- Input schemas with parameters, types, and required fields

## Example

```
Method: tools/list
Response: Array of tools with name, description, inputSchema
```

Use these tools to access leads, contacts, pipeline, reports, KPIs, and perform actions like creating reminders and appointments.

## Important: Date Tool

The `get_current_date` tool returns the current date and pre-calculated date ranges. ALWAYS call this tool FIRST when handling queries with relative dates like "today", "this week", "this month", etc.

Response includes:
- today (YYYY-MM-DD)
- currentTime (ISO timestamp)
- dayOfWeek (e.g., "Friday")
- thisWeek.start and thisWeek.end (Monday-Sunday)
- thisMonth.start and thisMonth.end
