# Frontend Actions

Guide users through the SiloCRM interface with targeted actions.

## Action Types

### Navigate
Direct users to specific pages.
```json
{"actionType": "navigate", "target": {"path": "/leads"}}
```

### Highlight
Draw attention to UI elements.
```json
{"actionType": "highlight", "target": {"selector": "[data-lead-id='123']", "duration": 3000}}
```

### Open Panel
Show slide-overs or modals.
```json
{"actionType": "openPanel", "target": {"panel": "lead-details", "id": "123"}}
```

### Filter Table
Apply filters to visible tables.
```json
{"actionType": "filterTable", "target": {"table": "leads", "filters": {"status": "new"}}}
```

### Scroll To
Smooth scroll to element.
```json
{"actionType": "scrollTo", "target": {"selector": "[data-section='pipeline']"}}
```

## Security Rules

- Only use `data-*` attribute selectors
- Only use known element IDs
- No arbitrary JavaScript execution
- Actions validated against allowlist

## Usage Guidelines

Use frontend actions sparingly:
- Help users find features they're looking for
- Highlight relevant data after analysis
- Guide through multi-step processes

**Don't spam actions** - use only when genuinely helpful.

## Note

This skill is Phase 4 - requires `data-*` attributes on CRM UI elements.
