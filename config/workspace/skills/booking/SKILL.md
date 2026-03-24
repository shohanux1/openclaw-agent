# Booking & Reminders

Create tasks, reminders, and appointments in SiloCRM.

## Tools

Uses MCP tools from `silocrm` server:
- `silocrm.tasks.createReminder` - Create reminder/task
- `silocrm.appointments.book` - Book appointment with contact

## Reminder Types

- `call` - Phone call reminder
- `email` - Email follow-up
- `meeting` - Meeting reminder
- `follow_up` - General follow-up
- `task` - Generic task
- `other` - Other

## Priority Levels

- `low`
- `medium`
- `high`
- `urgent`

## Appointment Types

- `consultation`
- `demo`
- `follow_up`
- `sales_call`
- `onboarding`
- `review`
- `other`

## Usage Protocol

**ALWAYS confirm before creating:**

1. Parse user request for details
2. Show preview of what will be created
3. Ask for confirmation
4. Execute only after user approves

## Example Flow

User: "Remind me to call John tomorrow at 2pm"

Agent:
1. Search for contact "John"
2. Preview: "Create call reminder for John Doe, tomorrow 2:00 PM"
3. Ask: "Should I create this reminder?"
4. On confirmation: Execute `silocrm.tasks.createReminder`
