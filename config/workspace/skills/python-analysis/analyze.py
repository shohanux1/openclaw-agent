#!/usr/bin/env python3
"""
Python Analysis Script for SiloPilot
Processes CRM data and generates visualizations.
"""

import json
from typing import Any


def analyze_leads(leads: list[dict]) -> dict:
    """Analyze leads and generate chart data."""
    charts = []

    # Breakdown by source
    source_counts = {}
    for lead in leads:
        source = lead.get("source") or "Unknown"
        source_counts[source] = source_counts.get(source, 0) + 1

    chart_data = [{"name": k, "value": v} for k, v in source_counts.items() if v > 0]
    if chart_data:
        charts.append({
            "type": "pie",
            "title": "Leads by Source",
            "data": chart_data
        })

    # Breakdown by status
    status_counts = {}
    for lead in leads:
        status = lead.get("status") or "Unknown"
        status_counts[status] = status_counts.get(status, 0) + 1

    chart_data = [{"name": k, "value": v} for k, v in status_counts.items() if v > 0]
    if chart_data:
        charts.append({
            "type": "bar",
            "title": "Leads by Status",
            "xAxisLabel": "Status",
            "yAxisLabel": "Count",
            "data": chart_data
        })

    # Value breakdown
    source_values = {}
    for lead in leads:
        source = lead.get("source") or "Unknown"
        value = lead.get("value")
        if value:
            try:
                val = float(value) if isinstance(value, str) else value
                if val > 0:
                    source_values[source] = source_values.get(source, 0) + val
            except (ValueError, TypeError):
                pass

    chart_data = [{"name": k, "value": v} for k, v in source_values.items() if v > 0]
    if chart_data:
        charts.append({
            "type": "bar",
            "title": "Total Value by Source",
            "xAxisLabel": "Source",
            "yAxisLabel": "Value ($)",
            "data": chart_data
        })

    return {
        "total_leads": len(leads),
        "charts": charts
    }


def main(input_data: dict[str, Any]) -> dict[str, Any]:
    """Main entry point for OpenClaw Python execution."""
    output = {
        "success": True,
        "charts": [],
        "message": ""
    }

    leads = input_data.get("leads", [])

    if not leads:
        output["message"] = "No leads data provided"
        return output

    result = analyze_leads(leads)
    output["charts"] = result["charts"]
    output["message"] = f"Analyzed {result['total_leads']} leads"

    return output


if __name__ == "__main__":
    # For testing
    test_data = {
        "leads": [
            {"source": "Facebook", "status": "new", "value": 5000},
            {"source": "Google", "status": "qualified", "value": 10000},
            {"source": "Facebook", "status": "new", "value": 3000},
        ]
    }
    result = main(test_data)
    print(json.dumps(result, indent=2))
