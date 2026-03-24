# Automation & Workflows

Create follow-up sequences and automation workflows in SiloCRM.

## Tools

Uses MCP tools from `silocrm` server:
- `silocrm.sequences.create` - Create follow-up message sequence
- `silocrm.workflows.create` - Create automation workflow

## Sequence Types

- `sms` - SMS-only sequence
- `email` - Email-only sequence
- `mixed` - Combined SMS and email

## Workflow Triggers

- `lead_created` - New lead created
- `stage_changed` - Pipeline stage change
- `tag_added` - Tag applied to contact
- `contact_created` - New contact created
- `manual` - Manual trigger

## Assignment Types

- `round_robin` - Distribute evenly
- `least_busy` - Assign to least loaded user
- `specific_user` - Assign to specific user(s)
- `random` - Random assignment

## Usage Protocol

**CRITICAL: Workflows are saved as INACTIVE**

1. Understand user's automation goal
2. Design the workflow/sequence
3. Show detailed preview
4. Ask for confirmation
5. Create as INACTIVE
6. Inform user to review and activate in UI

## Example Flow

User: "Create a workflow to assign new leads round robin"

Agent:
1. Design workflow with `lead_created` trigger
2. Preview:
   - Trigger: New lead created
   - Action: Round-robin assignment
   - Status: Will be saved as INACTIVE
3. Ask: "Should I create this workflow?"
4. On confirmation: Execute `silocrm.workflows.create`
