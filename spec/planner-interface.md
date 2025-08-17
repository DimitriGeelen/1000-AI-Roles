# Planner Interface Specification

## Version History
- v1.0 (2025-08-17): Initial standardized planner interface for multi-platform support

## Overview
This document defines the standardized, platform-agnostic interface that ALL agents must use to communicate with planner agents (Azure DevOps, Jira, Monday, etc.). This ensures complete decoupling of agents from specific project management platforms.

## Standardized Commands

### 1. CREATE_WORK_ITEM
Creates a new work item in the project management system.

```json
{
  "command": "CREATE_WORK_ITEM",
  "agent": "requesting-agent-name",
  "data": {
    "type": "Epic|Feature|UserStory|PBI|Task|Bug",
    "title": "Work item title",
    "description": "Detailed description",
    "parent_id": "optional-parent-work-item-id",
    "priority": 1-4,
    "estimate": "story-points-or-hours",
    "tags": ["tag1", "tag2"]
  }
}
```

### 2. UPDATE_STATUS
Updates the status/state of an existing work item.

```json
{
  "command": "UPDATE_STATUS", 
  "agent": "requesting-agent-name",
  "work_item_id": "existing-item-id",
  "data": {
    "status": "New|Active|InProgress|Resolved|Closed|Blocked",
    "comment": "Reason for status change"
  }
}
```

### 3. ATTACH_EVIDENCE
Attaches files, documentation, or artifacts to work items.

```json
{
  "command": "ATTACH_EVIDENCE",
  "agent": "requesting-agent-name",
  "work_item_id": "target-work-item-id",
  "data": {
    "evidence": "base64-encoded-file-content",
    "evidence_name": "filename.ext",
    "evidence_type": "architecture|code|test|documentation",
    "description": "What this evidence demonstrates"
  }
}
```

### 4. LINK_ITEMS
Creates relationships between work items or external resources.

```json
{
  "command": "LINK_ITEMS",
  "agent": "requesting-agent-name",
  "work_item_id": "source-item-id",
  "data": {
    "target_ids": ["item1", "item2"],
    "link_type": "Parent|Child|Related|Tests|TestedBy|Blocks|BlockedBy",
    "external_links": [
      {
        "type": "commit|pull-request|build|release",
        "url": "https://...",
        "description": "Link description"
      }
    ]
  }
}
```

### 5. REPORT_METRICS
Reports performance metrics, test results, or quality indicators.

```json
{
  "command": "REPORT_METRICS",
  "agent": "requesting-agent-name",
  "work_item_id": "related-work-item-id",
  "data": {
    "metrics": {
      "tests_passed": 45,
      "tests_failed": 3,
      "code_coverage": 87.5,
      "execution_time": "1250ms",
      "complexity_score": 12
    },
    "timestamp": "ISO-8601-timestamp"
  }
}
```

### 6. REQUEST_BYPASS
Requests human approval to bypass validation rules.

```json
{
  "command": "REQUEST_BYPASS",
  "agent": "requesting-agent-name",
  "data": {
    "blocked_action": "What agent is trying to do",
    "blocked_reason": "Why it's blocked",
    "justification": "Why bypass is needed",
    "risk_level": "low|medium|high",
    "expires_in": "duration-for-bypass-validity"
  }
}
```

## Standard Response Format

All planners must respond with this standardized format:

```json
{
  "success": true|false,
  "work_item_id": "created-or-updated-id",
  "work_item_url": "direct-link-to-item",
  "state": "current-state-of-item",
  "message": "Human-readable-result",
  "bypass_required": false|true,
  "bypass_token": "token-if-bypass-approved",
  "errors": ["error1", "error2"],
  "warnings": ["warning1", "warning2"]
}
```

## Agent Integration Requirements

### Required Reporting Points

Each agent MUST report at these critical points:

1. **Before Starting Work**
   - Verify work item exists and is in correct state
   - Request work item assignment

2. **During Work**
   - Report progress at significant milestones
   - Attach intermediate artifacts
   - Report any blockers

3. **After Completing Work**
   - Update status to completion state
   - Attach final deliverables
   - Report metrics and quality indicators
   - Link any created resources

### Blocking Rules

Agents MUST NOT proceed if:
- Parent work item doesn't exist
- Work item is not in expected state
- Previous required evidence not attached
- Validation rules not satisfied

Unless: Bypass token obtained through REQUEST_BYPASS

## Implementation by Agent

### project-initiator
```javascript
// After creating project-brief.md
planner.send({
  command: "CREATE_WORK_ITEM",
  agent: "project-initiator",
  data: {
    type: "Epic",
    title: projectTitle,
    description: projectBrief
  }
});
```

### requirements-collector
```javascript
// For each identified feature
planner.send({
  command: "CREATE_WORK_ITEM",
  agent: "requirements-collector",
  data: {
    type: "Feature",
    title: featureTitle,
    parent_id: epicId
  }
});

// Attach user stories
planner.send({
  command: "ATTACH_EVIDENCE",
  agent: "requirements-collector",
  work_item_id: featureId,
  data: {
    evidence: base64UserStories,
    evidence_name: "user-stories.md",
    evidence_type: "documentation"
  }
});
```

### architect
```javascript
// Update feature status
planner.send({
  command: "UPDATE_STATUS",
  agent: "architect",
  work_item_id: featureId,
  data: {
    status: "Active",
    comment: "Architecture design complete"
  }
});

// Attach architecture
planner.send({
  command: "ATTACH_EVIDENCE",
  agent: "architect",
  work_item_id: featureId,
  data: {
    evidence: base64Architecture,
    evidence_name: "architecture.md",
    evidence_type: "architecture"
  }
});
```

### tdd-evidence-specialist
```javascript
// Report test results
planner.send({
  command: "REPORT_METRICS",
  agent: "tdd-evidence-specialist",
  work_item_id: pbiId,
  data: {
    metrics: {
      tests_passed: passCount,
      tests_failed: failCount,
      code_coverage: coverage
    }
  }
});

// Create bugs for failures
if (failCount > 0) {
  planner.send({
    command: "CREATE_WORK_ITEM",
    agent: "tdd-evidence-specialist",
    data: {
      type: "Bug",
      title: `Test failure: ${testName}`,
      parent_id: pbiId,
      priority: 2
    }
  });
}
```

### coder
```javascript
// Update task status
planner.send({
  command: "UPDATE_STATUS",
  agent: "coder",
  work_item_id: taskId,
  data: {
    status: "Done",
    comment: "Implementation complete"
  }
});

// Link commits
planner.send({
  command: "LINK_ITEMS",
  agent: "coder",
  work_item_id: taskId,
  data: {
    external_links: [{
      type: "commit",
      url: commitUrl,
      description: commitMessage
    }]
  }
});
```

## Planner Implementation Requirements

Any planner (Azure DevOps, Jira, etc.) MUST:

1. **Accept** all standardized commands
2. **Validate** according to defined rules
3. **Execute** platform-specific API calls
4. **Store** all evidence in the platform
5. **Respond** with standardized format
6. **Block** agents when validation fails
7. **Track** all operations for audit

## Migration Guide

To add a new planner (e.g., Jira):
1. Copy azure-devops-planner.md as template
2. Replace Azure DevOps API calls with Jira API
3. Map standardized commands to Jira concepts
4. Maintain same validation rules
5. Return same response format

This ensures agents work with ANY planner without modification.