# Azure CLI Evidence Enhancement Quick Reference

**Version**: 1.0  
**Date**: 2025-08-17  
**Purpose**: Fast command reference for zero-customization evidence enhancement

## Essential Commands

### Work Item Inspection
```bash
# View work item details
az boards work-item show --id [ID]

# View specific fields only
az boards work-item show --id [ID] --query "fields.['System.Title','System.State','System.Description']"

# View work item relationships
az boards work-item show --id [ID] --query "relations"

# List your assigned work items
az boards work-item list --assigned-to-me --output table
```

### Evidence Enhancement Commands

#### Update Description with Evidence Template
```bash
# Method 1: Direct text input
az boards work-item update --id [ID] --description "[Your enhanced description]"

# Method 2: From file
az boards work-item update --id [ID] --description "$(cat evidence-template.md)"

# Method 3: Using heredoc for complex content
az boards work-item update --id [ID] --description "$(cat <<'EOF'
# Enhanced Evidence Template
## Implementation Evidence
[Your content here]
EOF
)"
```

#### Add Evidence Comments
```bash
# Add progress comment
az boards work-item update --id [ID] --discussion "✅ Evidence enhancement applied: [Description]"

# Add handoff comment
az boards work-item update --id [ID] --discussion "🔄 HANDOFF: [Agent/Team] - [Activity completed]"

# Add completion comment
az boards work-item update --id [ID] --discussion "🎯 COMPLETE: [Deliverable] ready for [next phase]"
```

#### Evidence Classification Tags
```bash
# Add evidence completion tag
az boards work-item update --id [ID] --fields "System.Tags=evidence-complete"

# Add multiple evidence tags
az boards work-item update --id [ID] --fields "System.Tags=evidence-complete; impl-code; qa-reviewed"

# Add implementation status tags
az boards work-item update --id [ID] --fields "System.Tags=impl-architecture; phase-1; sprint-1-2"
```

### Batch Operations

#### Multiple Work Item Updates
```bash
# Update evidence tags for multiple items
for id in 22 23 24 25 26; do
  az boards work-item update --id $id --fields "System.Tags=evidence-complete; sprint-1-2"
done

# Add completion comments to multiple items
work_items=(22 23 24 25 26)
for id in "${work_items[@]}"; do
  az boards work-item update --id $id --discussion "✅ Evidence enhancement complete"
done
```

#### Sprint Evidence Enhancement
```bash
# Get all work items in current sprint
sprint_items=$(az boards work-item list --wiql "SELECT [System.Id] FROM workitems WHERE [System.IterationPath] = 'YourProject\\CurrentSprint'" --query "[].id" --output tsv)

# Apply evidence tags to entire sprint
for id in $sprint_items; do
  az boards work-item update --id $id --fields "System.Tags=evidence-pending"
done
```

### Evidence Queries

#### Find Work Items by Evidence Status
```bash
# Work items with complete evidence
az boards work-item list --wiql "SELECT [System.Id], [System.Title], [System.State] FROM workitems WHERE [System.Tags] CONTAINS 'evidence-complete'"

# Work items missing evidence
az boards work-item list --wiql "SELECT [System.Id], [System.Title] FROM workitems WHERE [System.Tags] NOT CONTAINS 'evidence-complete' AND [System.State] = 'Closed'"

# Work items by implementation status
az boards work-item list --wiql "SELECT [System.Id], [System.Title], [System.Tags] FROM workitems WHERE [System.Tags] CONTAINS 'impl-code'"
```

#### Sprint Evidence Report
```bash
# Complete sprint evidence status
az boards work-item list --wiql "SELECT [System.Id], [System.Title], [System.Tags], [System.State] FROM workitems WHERE [System.IterationPath] = 'fnb-pricing\\Sprint-1-2-Event-Creation'" --output table

# Evidence completion percentage
total=$(az boards work-item list --wiql "SELECT [System.Id] FROM workitems WHERE [System.IterationPath] = 'fnb-pricing\\Sprint-1-2-Event-Creation'" --query "length(@)")
complete=$(az boards work-item list --wiql "SELECT [System.Id] FROM workitems WHERE [System.IterationPath] = 'fnb-pricing\\Sprint-1-2-Event-Creation' AND [System.Tags] CONTAINS 'evidence-complete'" --query "length(@)")
echo "Evidence completion: $complete/$total work items"
```

### Attachment Management

#### Upload Evidence Artifacts
```bash
# Upload test results
az boards work-item attachment upload --id [ID] --file test-results.json

# Upload multiple files
for file in test-results.json coverage-report.html performance-metrics.csv; do
  az boards work-item attachment upload --id [ID] --file $file
done

# Upload with description
az boards work-item attachment upload --id [ID] --file screenshot.png --description "UI validation screenshot"
```

#### List Attachments
```bash
# View work item attachments
az boards work-item show --id [ID] --query "relations[?rel=='AttachedFile']"
```

### Relationship Management

#### Create Evidence Relationships
```bash
# Link task to test case
az boards work-item relation add --id [TASK_ID] --relation-type "Microsoft.VSTS.Common.TestedBy-Forward" --target-id [TEST_CASE_ID]

# Link to related work items
az boards work-item relation add --id [ID] --relation-type "System.LinkTypes.Related" --target-id [RELATED_ID]

# Link to external documentation
az boards work-item relation add --id [ID] --relation-type "Hyperlink" --target-url "https://docs.example.com/implementation"
```

#### Verify Relationships
```bash
# Check parent-child relationships
az boards work-item show --id [ID] --query "relations[?contains(rel, 'Hierarchy')]"

# Check test relationships
az boards work-item show --id [ID] --query "relations[?contains(rel, 'TestedBy')]"
```

## Command Templates

### Evidence Enhancement Workflow
```bash
#!/bin/bash
# Evidence enhancement script for work item

WORK_ITEM_ID=$1
EVIDENCE_TYPE=$2  # user-story, task, test-case

# Apply evidence template
echo "Applying $EVIDENCE_TYPE evidence template to work item $WORK_ITEM_ID"
az boards work-item update --id $WORK_ITEM_ID --description "$(cat templates/$EVIDENCE_TYPE-evidence.md)"

# Add evidence classification tag
az boards work-item update --id $WORK_ITEM_ID --fields "System.Tags=evidence-complete; $EVIDENCE_TYPE"

# Add completion comment
az boards work-item update --id $WORK_ITEM_ID --discussion "✅ Evidence enhancement applied: $EVIDENCE_TYPE template with comprehensive documentation"

echo "Evidence enhancement complete for work item $WORK_ITEM_ID"
```

### Sprint Evidence Report
```bash
#!/bin/bash
# Generate evidence completion report for sprint

SPRINT_PATH="fnb-pricing\\Sprint-1-2-Event-Creation"

echo "Evidence Enhancement Report for $SPRINT_PATH"
echo "================================================="

# Total work items
total=$(az boards work-item list --wiql "SELECT [System.Id] FROM workitems WHERE [System.IterationPath] = '$SPRINT_PATH'" --query "length(@)")
echo "Total work items: $total"

# Evidence complete
complete=$(az boards work-item list --wiql "SELECT [System.Id] FROM workitems WHERE [System.IterationPath] = '$SPRINT_PATH' AND [System.Tags] CONTAINS 'evidence-complete'" --query "length(@)")
echo "Evidence complete: $complete"

# Evidence pending
pending=$(($total - $complete))
echo "Evidence pending: $pending"

# Completion percentage
percentage=$((complete * 100 / total))
echo "Completion rate: $percentage%"

echo ""
echo "Work items missing evidence:"
az boards work-item list --wiql "SELECT [System.Id], [System.Title] FROM workitems WHERE [System.IterationPath] = '$SPRINT_PATH' AND [System.Tags] NOT CONTAINS 'evidence-complete'" --output table
```

## Error Handling and Troubleshooting

### Common Errors and Solutions

#### Authentication Issues
```bash
# Error: "Please run 'az login' to setup account"
az login

# Set default organization
az devops configure --defaults organization=https://dev.azure.com/YourOrg

# Set default project
az devops configure --defaults project=YourProject
```

#### Work Item Update Errors
```bash
# Error: "TF401027: You need the 'Edit work items in this node' permission"
# Solution: Contact Azure DevOps admin for permissions

# Error: "Work item does not exist or you do not have permissions"
# Verify work item ID exists
az boards work-item show --id [ID] --query "id"

# Error: "Field validation failed"
# Check field format and valid values
az boards work-item show --id [ID] --query "fields.['System.WorkItemType']"
```

#### Query Syntax Issues
```bash
# Error: "Invalid WIQL query"
# Test query syntax
az boards query --wiql "SELECT [System.Id] FROM workitems WHERE [System.State] = 'Active'"

# Use proper field names
az boards work-item show --id 1 --query "fields" | grep -i "tag"
```

### Validation Commands

#### Verify Evidence Enhancement
```bash
# Check if evidence template applied
az boards work-item show --id [ID] --query "fields.['System.Description']" | head -20

# Verify evidence tags
az boards work-item show --id [ID] --query "fields.['System.Tags']"

# Check comment history
az boards work-item show --id [ID] --query "fields.['System.CommentCount']"
```

#### Quality Assurance
```bash
# Verify all sections completed
description=$(az boards work-item show --id [ID] --query "fields.['System.Description']" --output tsv)
if [[ $description == *"## 🏗️ Implementation Evidence"* ]]; then
  echo "✅ Implementation evidence section present"
else
  echo "❌ Missing implementation evidence section"
fi
```

## Automation Scripts

### Daily Evidence Check
```bash
#!/bin/bash
# Daily check for work items missing evidence

echo "Daily Evidence Enhancement Check - $(date)"
echo "========================================"

# Get your active work items
active_items=$(az boards work-item list --assigned-to-me --wiql "SELECT [System.Id] FROM workitems WHERE [System.AssignedTo] = @Me AND [System.State] IN ('Active', 'Resolved')" --query "[].id" --output tsv)

missing_evidence=0
for id in $active_items; do
  tags=$(az boards work-item show --id $id --query "fields.['System.Tags']" --output tsv)
  if [[ $tags != *"evidence-complete"* ]]; then
    title=$(az boards work-item show --id $id --query "fields.['System.Title']" --output tsv)
    echo "⚠️  Work item $id missing evidence: $title"
    ((missing_evidence++))
  fi
done

if [ $missing_evidence -eq 0 ]; then
  echo "✅ All your active work items have evidence enhancement"
else
  echo "📝 $missing_evidence work items need evidence enhancement"
fi
```

### Weekly Team Report
```bash
#!/bin/bash
# Weekly team evidence enhancement report

TEAM_NAME="YourTeam"
START_DATE=$(date -d "7 days ago" +%Y-%m-%d)

echo "Weekly Evidence Enhancement Report - $TEAM_NAME"
echo "Period: $START_DATE to $(date +%Y-%m-%d)"
echo "=============================================="

# Work items completed this week
completed_items=$(az boards work-item list --wiql "SELECT [System.Id] FROM workitems WHERE [System.ChangedDate] >= '$START_DATE' AND [System.State] = 'Closed'" --query "[].id" --output tsv)

total_completed=$(echo $completed_items | wc -w)
evidence_complete=$(az boards work-item list --wiql "SELECT [System.Id] FROM workitems WHERE [System.ChangedDate] >= '$START_DATE' AND [System.State] = 'Closed' AND [System.Tags] CONTAINS 'evidence-complete'" --query "length(@)")

echo "Completed work items: $total_completed"
echo "With evidence enhancement: $evidence_complete"
echo "Evidence adoption rate: $((evidence_complete * 100 / total_completed))%"
```

## Power User Features

### Advanced Queries
```bash
# Find work items by evidence quality level
az boards work-item list --wiql "SELECT [System.Id], [System.Title] FROM workitems WHERE [System.Tags] CONTAINS 'evidence-comprehensive'"

# Cross-sprint evidence analysis
az boards work-item list --wiql "SELECT [System.IterationPath], COUNT(*) FROM workitems WHERE [System.Tags] CONTAINS 'evidence-complete' GROUP BY [System.IterationPath]"

# Evidence enhancement timeline
az boards work-item list --wiql "SELECT [System.Id], [System.Title], [System.ChangedDate] FROM workitems WHERE [System.History] CONTAINS 'Evidence enhancement' ORDER BY [System.ChangedDate] DESC"
```

### Bulk Operations
```bash
# Archive completed evidence
closed_items=$(az boards work-item list --wiql "SELECT [System.Id] FROM workitems WHERE [System.State] = 'Closed' AND [System.Tags] CONTAINS 'evidence-complete'" --query "[].id" --output tsv)

for id in $closed_items; do
  az boards work-item update --id $id --fields "System.Tags=evidence-archived; evidence-complete"
done
```

---

**Reference Status**: ✅ COMPLETE  
**Command Coverage**: COMPREHENSIVE  
**Error Handling**: INCLUDED  
**Automation Ready**: YES