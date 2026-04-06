# Tools

All CRM tools are pre-loaded. Do NOT call tools/list - use these definitions directly.

## Utility Tools

### get_current_date
Get the current date and time. ALWAYS call this tool FIRST before any date-based operations.

**Parameters:** None

**Response:**
- today: YYYY-MM-DD
- currentTime: ISO timestamp
- dayOfWeek: e.g., "Friday"
- thisWeek.start, thisWeek.end: Monday-Sunday range
- thisMonth.start, thisMonth.end: Month range

---

## Lead Tools

### silocrm_leads_count
Count leads, optionally filtered by date range and status.

**Parameters:**
- startDate (string, optional): Start date YYYY-MM-DD
- endDate (string, optional): End date YYYY-MM-DD
- status (string, optional): Filter by lead status

### silocrm_leads_list
List leads with optional filters, returns up to 50 leads.

**Parameters:**
- startDate (string, optional): Start date YYYY-MM-DD
- endDate (string, optional): End date YYYY-MM-DD
- status (string, optional): Filter by lead status
- limit (number, optional): Max leads 1-50
- assignedFilter (string, optional): "unassigned", "assigned", or "all"
- state (string, optional): Filter by contact's state (e.g., "Texas", "TX")
- lastContactedBefore (string, optional): Filter leads NOT contacted since this date YYYY-MM-DD
- lastContactedAfter (string, optional): Filter leads contacted AFTER this date YYYY-MM-DD

### silocrm_leads_get
Get detailed information about a specific lead by ID.

**Parameters:**
- leadId (string, REQUIRED): Lead UUID

### silocrm_leads_search
Search leads by first name, last name, or both.

**Parameters:**
- firstName (string, optional): First name to search
- lastName (string, optional): Last name to search
- limit (number, optional): Max results 1-50

---

## Contact Tools

### silocrm_contacts_conversations
Get conversation history for a contact (SMS, email, voice).

**Parameters:**
- contactId (string, optional): Contact UUID
- contactName (string, optional): Search by contact name
- channels (array, optional): ["sms", "email", "voice", "all"]
- limit (number, optional): Max messages 1-100

### silocrm_contacts_notes
Get notes for a contact.

**Parameters:**
- contactId (string, optional): Contact UUID
- contactName (string, optional): Search by contact name
- limit (number, optional): Max notes 1-50

---

## Pipeline Tools

### silocrm_pipeline_analytics
Get pipeline analytics with stage distribution and projections.

**Parameters:**
- startDate (string, REQUIRED): Start date YYYY-MM-DD
- endDate (string, REQUIRED): End date YYYY-MM-DD
- includeProjections (boolean, optional): Include revenue projections

### silocrm_pipeline_stages
List all available pipeline stages.

**Parameters:** None

### silocrm_pipeline_leadsByStage
Get leads in a specific pipeline stage.

**Parameters:**
- stageName (string, REQUIRED): Pipeline stage name
- minDaysInStage (number, optional): Filter leads stuck for X days
- limit (number, optional): Max leads 1-100

---

## Report Tools

### silocrm_reports_performance
Generate comprehensive performance metrics report.

**Parameters:**
- reportType (string, REQUIRED): "weekly", "monthly", "quarterly", or "custom"
- startDate (string, REQUIRED): Start date YYYY-MM-DD
- endDate (string, REQUIRED): End date YYYY-MM-DD
- includeCharts (boolean, optional): Include chart data
- compareWithPrevious (boolean, optional): Compare with previous period

### silocrm_reports_objections
Analyze objections from notes and call transcripts.

**Parameters:**
- startDate (string, REQUIRED): Start date YYYY-MM-DD
- endDate (string, REQUIRED): End date YYYY-MM-DD
- dealStage (string, optional): Filter by pipeline stage
- categories (array, optional): Objection categories to focus on

---

## KPI Tools

### silocrm_kpi_metrics
Get KPI metrics (CPL, CPA, deals closed, best platform, etc.).

**Parameters:**
- metricType (string, REQUIRED): "cost_per_lead", "cost_per_appointment", "deals_closed", "best_platform", "phone_calls", "call_to_lead_conversion", or "all"
- startDate (string, optional): Start date YYYY-MM-DD
- endDate (string, optional): End date YYYY-MM-DD
- compareWithPrevious (boolean, optional): Compare with previous period
- platform (string, optional): Filter by platform

### silocrm_kpi_adSpend
Get advertising spend data by platform.

**Parameters:**
- startDate (string, REQUIRED): Start date YYYY-MM-DD
- endDate (string, REQUIRED): End date YYYY-MM-DD
- platform (string, optional): Filter by platform
- groupBy (string, optional): "day", "week", "month", or "platform"

### silocrm_kpi_phoneAnalytics
Get phone call analytics.

**Parameters:**
- startDate (string, REQUIRED): Start date YYYY-MM-DD
- endDate (string, REQUIRED): End date YYYY-MM-DD
- direction (string, optional): "inbound", "outbound", or "all"
- includeConversions (boolean, optional): Include conversion data
- groupBy (string, optional): "day", "week", "month", or "user"

---

## Knowledge Tools

### silocrm_knowledge_search
Search knowledge base documents and CRM data.

**Parameters:**
- query (string, REQUIRED): Search query
- limit (number, optional): Max results 1-20
- sourceType (string, optional): "document", "crm", or "all"

---

## Action Tools (Write Operations)

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
