# Available Skills

## 1. CRM Data Access

Access lead, contact, and pipeline data from SiloCRM.

### Lead Tools
- `silocrm_leads_count` - Count leads by date range, status
- `silocrm_leads_list` - List leads with filters (up to 50)
- `silocrm_leads_get` - Get lead details by ID
- `silocrm_leads_search` - Search leads by name

### Contact Tools
- `silocrm_contacts_conversations` - SMS, email, voice history
- `silocrm_contacts_notes` - Contact notes

### Pipeline Tools
- `silocrm_pipeline_analytics` - Stage distribution, projections
- `silocrm_pipeline_stages` - List available stages
- `silocrm_pipeline_leadsByStage` - Leads in specific stage

**Usage:** When users ask about leads, contacts, or pipeline - fetch data, format clearly, generate visualizations, offer actionable insights.

---

## 2. Analytics & Reports

Generate performance reports and KPI metrics.

### Report Tools
- `silocrm_reports_performance` - Weekly/monthly/quarterly performance
- `silocrm_reports_objections` - Objection analysis from notes/transcripts

### KPI Tools
- `silocrm_kpi_metrics` - CPL, CPA, deals closed, best platform
- `silocrm_kpi_adSpend` - Advertising spend by platform
- `silocrm_kpi_phoneAnalytics` - Call analytics and conversions

**Usage:** When users ask about performance, metrics, or analytics - fetch data, **always generate charts** (bar, pie, line), compare with previous periods, highlight key insights.

---

## 3. Automation & Workflows

Create follow-up sequences and automation workflows.

### Tools
- `silocrm_sequences_create` - Create follow-up message sequence
- `silocrm_workflows_create` - Create automation workflow

### Sequence Types
- `sms` - SMS-only sequence
- `email` - Email-only sequence
- `mixed` - Combined SMS and email

### Workflow Triggers
- `lead_created` - New lead created
- `stage_changed` - Pipeline stage change
- `tag_added` - Tag applied to contact
- `contact_created` - New contact created
- `manual` - Manual trigger

### Assignment Types
- `round_robin` - Distribute evenly
- `least_busy` - Assign to least loaded user
- `specific_user` - Assign to specific user(s)
- `random` - Random assignment

**CRITICAL:** Workflows are saved as INACTIVE. Always show preview and ask for confirmation before creating.

---

## 4. Booking & Reminders

Create tasks, reminders, and appointments.

### Tools
- `silocrm_tasks_createReminder` - Create reminder/task
- `silocrm_appointments_book` - Book appointment with contact

### Reminder Types
`call`, `email`, `meeting`, `follow_up`, `task`, `other`

### Priority Levels
`low`, `medium`, `high`, `urgent`

### Appointment Types
`consultation`, `demo`, `follow_up`, `sales_call`, `onboarding`, `review`, `other`

**ALWAYS confirm before creating:** Parse request, show preview, ask confirmation, execute only after approval.

---

## 5. Knowledge Base Search

Search organization documents and CRM data.

### Tool
- `silocrm_knowledge_search` - Vector search across documents and CRM

### Content Sources
- **Documents:** SOPs, playbooks, product info, training materials
- **CRM Data:** Contact notes, call transcripts, lead descriptions

**Usage:** Search knowledge base first, cite document sources, synthesize answers.

---

## 6. Python Data Analysis

Execute Python scripts for advanced analysis and visualization.

### Capabilities
- Calculate statistics from CRM data
- Generate charts (bar, pie, line)
- Perform trend analysis
- Create data breakdowns

### Security
- Runs in isolated Docker container
- No direct database access - only MCP data
- Sandboxed execution

**Rules:** Always filter out zero values from charts, use real data from `input_data`, never mock data.

---

## 7. Frontend Actions (Phase 4)

Guide users through the SiloCRM interface with targeted actions.

### Action Types
- `navigate` - Direct users to specific pages
- `highlight` - Draw attention to UI elements
- `openPanel` - Show slide-overs or modals
- `filterTable` - Apply filters to visible tables
- `scrollTo` - Smooth scroll to element

**Security:** Only use `data-*` attribute selectors, known element IDs, no arbitrary JS execution.

**Usage:** Use sparingly - help find features, highlight relevant data, guide through multi-step processes. Don't spam actions.

---

## Tool Naming Convention

All tools use underscores: `silocrm_category_action`

Examples:
- `silocrm_leads_count`
- `silocrm_pipeline_analytics`
- `silocrm_tasks_createReminder`
