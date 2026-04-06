# Tools

All tools are pre-loaded. Do NOT call tools/list - use these definitions directly.

---

## Semantic Search Tools (Vector Search)

### semantic_search
Search CRM records using natural language (semantic similarity, not keywords). Finds records with similar meaning even if exact words don't match.

**Parameters:**
- query (string, REQUIRED): Natural language search query
- limit (number, optional): Max results 1-20, default 10
- types (array, optional): Filter by ["leads", "contacts", "notes"]

**Use when:**
- Structured tools don't find exact matches
- User asks vague or conceptual questions
- Looking for patterns across records

**Examples:**
- "Find leads who mentioned budget concerns"
- "Contacts interested in solar panels"
- "Notes about installation timeline"
- "Leads worried about pricing"

### index_now
Force re-index all CRM data into vector database. Call this FIRST before searching to ensure data is loaded.

**Parameters:** None

**Returns:** success, indexed_count, message

### index_status
Check vector search index health and record counts.

**Parameters:** None

**Returns:** indexed_count, last_sync, types breakdown
