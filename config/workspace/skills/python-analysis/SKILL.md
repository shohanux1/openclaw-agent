# Python Data Analysis

Execute Python scripts for advanced data analysis and visualization.

## Capabilities

- Calculate statistics from CRM data
- Generate charts (bar, pie, line)
- Perform trend analysis
- Create data breakdowns

## Security

- Runs in isolated Docker container
- No database access - only MCP data
- No network access except MCP
- Sandboxed execution

## Usage Pattern

1. Fetch data using CRM tools first
2. Pass data to Python script as `input_data`
3. Process and calculate metrics
4. Return charts in `output["charts"]`

## Chart Output Format

```python
output["charts"] = [
    {
        "type": "pie",  # or "bar", "line"
        "title": "Leads by Source",
        "data": [
            {"name": "Facebook", "value": 45},
            {"name": "Google", "value": 30}
        ]
    }
]
```

## Rules

- **Always filter out zero values** from charts
- Try multiple breakdowns if first has no data
- Use real data from `input_data`, never mock
