# Tools

All tools are pre-loaded. Do NOT call tools/list - use these definitions directly.

---

## Utility Tools

### get_current_date
Get the current date. **MUST be called FIRST** for any time-relative queries like "today", "this week", "this month", "yesterday", etc.

**Parameters:** None

**Returns:**
- today: Current date (YYYY-MM-DD)
- dayOfWeek: Current day name
- weekStart: Monday of current week
- weekEnd: Sunday of current week
- monthStart: First day of current month
- monthEnd: Last day of current month

**CRITICAL:** Never guess or assume dates. Always call this tool first for time-relative queries.

---

## Analytics Tools (SiloCRM)

### silocrm_pipeline_analytics
Get pipeline analytics with stage metrics and chart data. **Use this for pipeline overviews, stage breakdowns, and revenue projections.**

**Parameters:**
- startDate (string, REQUIRED): Start date YYYY-MM-DD (get from get_current_date)
- endDate (string, REQUIRED): End date YYYY-MM-DD (get from get_current_date)
- includeProjections (boolean, optional): Include revenue projections

**Returns:**
- stageMetrics: Count and value per stage
- summary: Total leads, pipeline value, avg deal size
- projections: Revenue projections (if requested)
- charts: Pre-formatted chart data for visualization

**When to use:**
- "Show me my pipeline" → Use this tool
- "Pipeline overview" → Use this tool
- "Leads by stage" → Use this tool
- "Stage breakdown" → Use this tool
- Any analytics/chart request about pipeline

---

## Search Tools (Qdrant Vector Search)

Use semantic search for finding specific records by content/criteria.

### semantic_search
Search CRM records using natural language (semantic similarity). Finds records with similar meaning even if exact words don't match.

**Parameters:**
- query (string, REQUIRED): Natural language search query
- limit (number, optional): Max results 1-20, default 10
- types (array, optional): Filter by record type: ["lead", "note", "message", "call"]

**Use for ALL read/search operations:**
- Finding leads by any criteria (status, interest, concerns, location, etc.)
- Searching contacts and their information
- Finding conversation history and messages
- Searching notes and call transcripts
- Pipeline and stage queries
- Any query about existing CRM data

**Examples:**
- "Find leads who mentioned budget concerns"
- "Contacts interested in solar panels"
- "Show me leads in Texas"
- "Notes about installation timeline"
- "Leads who haven't been contacted recently"
- "Messages about pricing questions"
- "Call transcripts mentioning financing"
- "Leads in the appointment stage"

---

## Action Tools (Write Operations)

These tools create new records in SiloCRM. Confirm with user before executing.

### silocrm_sequences_create
Create a follow-up message sequence (returns preview, does not auto-send).

**Parameters:**
- leadIds (array, REQUIRED): Lead UUIDs to include
- sequenceType (string, REQUIRED): "sms", "email", or "mixed"
- messageCount (number, optional): Number of messages 1-10
- delayDays (array, optional): Days between messages
- context (string, optional): Context for message generation

### silocrm_workflows_create
Create an automation workflow (saved as INACTIVE).

**Parameters:**
- triggerType (string, REQUIRED): "lead_created", "stage_changed", "tag_added", "contact_created", or "manual"
- name (string, optional): Workflow name
- description (string, optional): Workflow description
- assignmentType (string, optional): "round_robin", "least_busy", "specific_user", or "random"
- userIds (array, optional): User IDs for assignment
- conditions (object, optional): Trigger conditions

### silocrm_tasks_createReminder
Create a reminder/task.

**Parameters:**
- title (string, REQUIRED): Reminder title
- dueDate (string, REQUIRED): Due date YYYY-MM-DD or relative
- description (string, optional): Additional details
- dueTime (string, optional): Due time HH:MM 24-hour
- contactId (string, optional): Contact UUID
- contactName (string, optional): Contact name to search
- reminderType (string, optional): "call", "email", "meeting", "follow_up", "task", or "other"
- priority (string, optional): "low", "medium", "high", or "urgent"

### silocrm_appointments_book
Book an appointment with a contact.

**Parameters:**
- title (string, REQUIRED): Appointment title
- startDate (string, REQUIRED): Start date YYYY-MM-DD or relative
- startTime (string, REQUIRED): Start time HH:MM 24-hour
- description (string, optional): Meeting agenda
- duration (number, optional): Duration in minutes 15-480
- contactId (string, optional): Contact UUID
- contactName (string, optional): Contact name to search
- appointmentType (string, optional): "consultation", "demo", "follow_up", "sales_call", "onboarding", "review", or "other"
- location (string, optional): Meeting location
- sendInvite (boolean, optional): Send calendar invite
- addGoogleMeet (boolean, optional): Add Google Meet link
- syncToGoogleCalendar (boolean, optional): Sync to Google Calendar

---

## Tool Selection Guide

| User Request | Tool to Use |
|-------------|-------------|
| "today", "this week", "this month" | get_current_date FIRST |
| Pipeline overview / analytics | silocrm_pipeline_analytics |
| Stage breakdown / distribution | silocrm_pipeline_analytics |
| Leads by stage (with chart) | silocrm_pipeline_analytics |
| Revenue projections | silocrm_pipeline_analytics |
| Find/search specific leads | semantic_search |
| Get lead details | semantic_search |
| Search contacts by criteria | semantic_search |
| Get conversation history | semantic_search |
| Find notes or call transcripts | semantic_search |
| Create follow-up sequence | silocrm_sequences_create |
| Create workflow/automation | silocrm_workflows_create |
| Create reminder/task | silocrm_tasks_createReminder |
| Book appointment | silocrm_appointments_book |

**Key distinction:**
- **silocrm_pipeline_analytics** = Aggregated data with charts (for overviews, summaries, distributions)
- **semantic_search** = Individual records (for finding specific leads, contacts, messages)
