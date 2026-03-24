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
