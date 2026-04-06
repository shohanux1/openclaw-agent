# Tools

All tools are pre-loaded. Do NOT call tools/list - use these definitions directly.

---

## Search Tools (Qdrant Vector Search)

All data search and read operations use semantic search via Qdrant.

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
| Find/search/show/list leads | semantic_search |
| Get lead details | semantic_search |
| Search contacts | semantic_search |
| Get conversation history | semantic_search |
| Find notes or call transcripts | semantic_search |
| Pipeline/stage queries | semantic_search |
| Any count/analytics questions | semantic_search |
| Create follow-up sequence | silocrm_sequences_create |
| Create workflow/automation | silocrm_workflows_create |
| Create reminder/task | silocrm_tasks_createReminder |
| Book appointment | silocrm_appointments_book |
