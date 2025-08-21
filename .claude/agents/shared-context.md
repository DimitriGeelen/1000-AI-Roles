# Shared Context Preservation System

## Overview
This system maintains context continuity across agent transitions, preventing information loss and ensuring each agent has complete understanding of project state, requirements, and previous work.

## 🧠 CONTEXT ARCHITECTURE

### CONTEXT STATE STRUCTURE
```typescript
interface SharedContext {
  project_metadata: ProjectMetadata;
  workflow_state: WorkflowState;
  agent_history: AgentHistory[];
  artifacts_registry: ArtifactsRegistry;
  quality_status: QualityStatus;
  stakeholder_decisions: StakeholderDecisions[];
}

interface ProjectMetadata {
  name: string;
  scope: string;
  success_criteria: string[];
  constraints: {
    technical: string[];
    business: string[];
    timeline: string[];
  };
  stakeholders: {
    product_owner: string;
    technical_lead: string;
    end_users: string[];
  };
}

interface WorkflowState {
  current_phase: "requirements" | "architecture" | "testing" | "implementation" | "documentation";
  completed_phases: string[];
  active_agents: string[];
  blocked_conditions: string[];
  next_planned_actions: string[];
}

interface AgentHistory {
  agent_name: string;
  execution_timestamp: string;
  input_context: any;
  output_artifacts: string[];
  quality_gates_passed: string[];
  handover_notes: string;
  success_indicators: string[];
  failure_points: string[];
}

interface ArtifactsRegistry {
  requirements: {
    user_stories: string;
    component_specs: string;
    acceptance_criteria: string;
    stakeholder_approvals: string[];
  };
  architecture: {
    system_design: string;
    component_interfaces: string;
    integration_points: string;
    technology_decisions: string;
  };
  testing: {
    test_specifications: string;
    execution_results: string;
    coverage_reports: string;
    visual_evidence: string[];
  };
  implementation: {
    source_code: string[];
    test_results: string;
    integration_validation: string;
    deployment_artifacts: string[];
  };
}
```

### CONTEXT PERSISTENCE MECHANISMS

#### 1. FILE-BASED CONTEXT STORAGE
```bash
# Create context snapshot
create_context_snapshot() {
  local timestamp=$(date +"%Y%m%d_%H%M%S")
  local context_file="context-snapshot-$timestamp.json"
  
  # Gather current state
  echo "{" > $context_file
  echo "  \"timestamp\": \"$(date -Iseconds)\"," >> $context_file
  echo "  \"project_metadata\": {" >> $context_file
  echo "    \"artifacts_present\": [" >> $context_file
  
  # List all project artifacts
  find . -name "*.md" -o -name "*.json" -o -name "*.tsx" -o -name "*.test.*" | \
    grep -v node_modules | \
    sed 's/.*/"&"/' | \
    paste -sd ',' >> $context_file
  
  echo "    ]," >> $context_file
  echo "    \"last_modified\": \"$(stat -c %Y *.md 2>/dev/null | sort -n | tail -1)\"" >> $context_file
  echo "  }" >> $context_file
  echo "}" >> $context_file
  
  echo "Context snapshot created: $context_file"
}

# Restore context from snapshot
restore_context_from_snapshot() {
  local snapshot_file=$1
  
  if [[ -f "$snapshot_file" ]]; then
    echo "=== CONTEXT RESTORATION ===" > context-restoration.md
    echo "Restored from: $snapshot_file" >> context-restoration.md
    echo "Restoration time: $(date)" >> context-restoration.md
    
    # Extract key information
    grep -o '"[^"]*\.md"' $snapshot_file >> context-restoration.md
    echo "Context restoration complete"
  else
    echo "❌ Context snapshot not found: $snapshot_file"
    return 1
  fi
}
```

#### 2. REAL-TIME CONTEXT TRACKING
```yaml
context_tracking:
  automatic_updates:
    file_creation: "Track when new artifacts are created"
    agent_transitions: "Record context at each agent handover"
    quality_gate_events: "Capture context at gate pass/fail"
    stakeholder_interactions: "Record decisions and approvals"
  
  change_detection:
    file_modifications: "Monitor changes to key artifacts"
    scope_evolution: "Track requirement changes over time"
    technology_decisions: "Record architecture evolution"
    quality_improvements: "Track evidence quality over time"
```

### CONTEXT VALIDATION PROTOCOLS

#### 1. CONTEXT INTEGRITY CHECKING
```bash
# Validate context integrity
validate_context_integrity() {
  echo "=== CONTEXT INTEGRITY CHECK ===" > context-validation.md
  echo "Validation time: $(date)" >> context-validation.md
  
  # Check for required artifacts
  local required_files=("user-stories.md" "component-specs.json" "acceptance-criteria.json")
  local missing_files=()
  
  for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
      missing_files+=("$file")
    fi
  done
  
  if [[ ${#missing_files[@]} -gt 0 ]]; then
    echo "❌ Missing critical artifacts: ${missing_files[*]}" >> context-validation.md
    return 1
  else
    echo "✅ All critical artifacts present" >> context-validation.md
  fi
  
  # Validate content consistency
  validate_content_consistency >> context-validation.md
  
  # Check timeline consistency
  validate_timeline_consistency >> context-validation.md
  
  return 0
}

validate_content_consistency() {
  echo "--- Content Consistency Check ---"
  
  # Check if component names are consistent across files
  if [[ -f "user-stories.md" && -f "component-specs.json" ]]; then
    local story_components=$(grep -o "Component.*:" user-stories.md | wc -l)
    local spec_components=$(jq 'length' component-specs.json 2>/dev/null || echo 0)
    
    if [[ $story_components -eq $spec_components ]]; then
      echo "✅ Component count consistent across files"
    else
      echo "❌ Component count mismatch: stories=$story_components, specs=$spec_components"
    fi
  fi
}

validate_timeline_consistency() {
  echo "--- Timeline Consistency Check ---"
  
  # Check file creation order makes sense
  local requirements_time=$(stat -c %Y user-stories.md 2>/dev/null || echo 0)
  local test_time=$(stat -c %Y evidence-tests.md 2>/dev/null || echo 0)
  
  if [[ $requirements_time -le $test_time ]]; then
    echo "✅ Logical file creation order"
  else
    echo "❌ Test files created before requirements"
  fi
}
```

#### 2. CONTEXT RECONSTRUCTION
```typescript
interface ContextReconstruction {
  artifact_analysis: {
    scan_existing_files: () => string[];
    extract_component_names: () => string[];
    identify_technology_stack: () => TechnologyStack;
    determine_project_scope: () => ProjectScope;
  };
  
  relationship_mapping: {
    map_requirements_to_tests: () => RequirementTestMapping[];
    identify_component_dependencies: () => ComponentDependency[];
    trace_stakeholder_decisions: () => StakeholderDecision[];
  };
  
  gap_identification: {
    find_missing_artifacts: () => string[];
    identify_incomplete_work: () => IncompleteWork[];
    detect_scope_drift: () => ScopeDrift[];
  };
}

class ContextReconstructor {
  async reconstructFromArtifacts(): Promise<SharedContext> {
    // Scan filesystem for existing artifacts
    const artifacts = await this.scanArtifacts();
    
    // Extract project metadata from artifacts
    const metadata = await this.extractMetadata(artifacts);
    
    // Reconstruct workflow state
    const workflowState = await this.reconstructWorkflowState(artifacts);
    
    // Build artifacts registry
    const registry = await this.buildArtifactsRegistry(artifacts);
    
    return {
      project_metadata: metadata,
      workflow_state: workflowState,
      agent_history: await this.reconstructAgentHistory(),
      artifacts_registry: registry,
      quality_status: await this.assessQualityStatus(),
      stakeholder_decisions: await this.extractStakeholderDecisions()
    };
  }
}
```

### AGENT CONTEXT HANDOVER

#### 1. CONTEXT PACKAGING FOR HANDOVER
```yaml
handover_context_package:
  summary_information:
    project_name: "{{project_name}}"
    current_phase: "{{workflow_phase}}"
    completed_work: "{{list_of_completed_artifacts}}"
    quality_gates_passed: "{{passed_gates}}"
  
  specific_instructions:
    next_agent_role: "{{target_agent}}"
    expected_deliverables: "{{specific_artifacts_needed}}"
    input_artifacts: "{{files_to_read_first}}"
    success_criteria: "{{measurable_completion_criteria}}"
  
  context_validation:
    artifacts_verified: "{{verification_timestamp}}"
    content_validated: "{{validation_results}}"
    stakeholder_approvals: "{{approval_status}}"
    blocking_conditions: "{{any_blocking_issues}}"
  
  continuity_information:
    previous_decisions: "{{key_decisions_made}}"
    technology_choices: "{{tech_stack_decisions}}"
    scope_boundaries: "{{what_is_in_out_of_scope}}"
    stakeholder_preferences: "{{user_preferences_and_constraints}}"
```

#### 2. CONTEXT VALIDATION AT HANDOVER
```bash
# Validate context before agent handover
validate_handover_context() {
  local target_agent=$1
  local handover_package="handover-to-$target_agent.json"
  
  echo "=== HANDOVER CONTEXT VALIDATION ===" > handover-validation.md
  echo "Target Agent: $target_agent" >> handover-validation.md
  echo "Validation Time: $(date)" >> handover-validation.md
  
  # Check all required context is present
  validate_required_context_elements $target_agent >> handover-validation.md
  
  # Verify artifacts are accessible
  validate_artifact_accessibility >> handover-validation.md
  
  # Confirm quality gates passed
  validate_quality_gates_status >> handover-validation.md
  
  # Create handover package
  create_handover_package $target_agent $handover_package
  
  echo "Handover package created: $handover_package"
}

validate_required_context_elements() {
  local agent=$1
  
  case $agent in
    "architect")
      check_files "user-stories.md component-specs.json acceptance-criteria.json"
      ;;
    "tdd-evidence-specialist")
      check_files "user-stories.md architecture.md component-interfaces.json"
      ;;
    "coder")
      check_files "evidence-tests.md test-execution-output.txt architecture.md"
      ;;
    *)
      echo "❌ Unknown agent type: $agent"
      return 1
      ;;
  esac
}
```

### CONTEXT EVOLUTION TRACKING

#### 1. CHANGE HISTORY MANAGEMENT
```typescript
interface ContextEvolution {
  change_events: ChangeEvent[];
  version_history: ContextVersion[];
  decision_trail: DecisionRecord[];
  scope_evolution: ScopeChange[];
}

interface ChangeEvent {
  timestamp: string;
  change_type: "artifact_creation" | "requirement_change" | "scope_modification" | "decision_reversal";
  affected_artifacts: string[];
  change_description: string;
  stakeholder_involved: string;
  impact_assessment: string;
}

interface ContextVersion {
  version_id: string;
  timestamp: string;
  snapshot_location: string;
  change_summary: string;
  artifacts_state: Record<string, string>;
  quality_gates_status: Record<string, boolean>;
}
```

#### 2. DECISION AUDIT TRAIL
```yaml
decision_tracking:
  requirement_decisions:
    - decision_id: "REQ_001"
      description: "Use EventCreationWizard for main component"
      stakeholder: "Product Owner"
      timestamp: "2025-08-17T10:30:00Z"
      rationale: "User research shows step-by-step approach preferred"
      artifacts_affected: ["user-stories.md", "component-specs.json"]
  
  technology_decisions:
    - decision_id: "TECH_001"
      description: "Use React 18 with TypeScript"
      stakeholder: "Technical Lead"
      timestamp: "2025-08-17T11:00:00Z"
      rationale: "Team expertise and project requirements align"
      artifacts_affected: ["tech-stack.json", "architecture.md"]
  
  scope_decisions:
    - decision_id: "SCOPE_001"
      description: "Include mobile-first design"
      stakeholder: "Product Owner"
      timestamp: "2025-08-17T11:30:00Z"
      rationale: "60% of users access via mobile devices"
      artifacts_affected: ["user-stories.md", "acceptance-criteria.json"]
```

### CONTEXT RECOVERY MECHANISMS

#### 1. AUTOMATIC CONTEXT BACKUP
```bash
# Automated context backup
setup_context_backup() {
  # Create backup directory
  mkdir -p .context-backups
  
  # Setup automatic backup on file changes
  echo "#!/bin/bash" > .context-backups/auto-backup.sh
  echo "timestamp=\$(date +%Y%m%d_%H%M%S)" >> .context-backups/auto-backup.sh
  echo "tar -czf .context-backups/context-\$timestamp.tar.gz *.md *.json" >> .context-backups/auto-backup.sh
  chmod +x .context-backups/auto-backup.sh
  
  # Schedule regular backups
  (crontab -l 2>/dev/null; echo "*/30 * * * * cd $(pwd) && ./.context-backups/auto-backup.sh") | crontab -
  
  echo "Automatic context backup configured"
}

# Context recovery from backup
recover_context_from_backup() {
  local backup_file=$1
  
  if [[ -f "$backup_file" ]]; then
    echo "=== CONTEXT RECOVERY ===" > context-recovery.log
    echo "Recovery time: $(date)" >> context-recovery.log
    echo "Source backup: $backup_file" >> context-recovery.log
    
    # Extract backup
    tar -xzf "$backup_file"
    
    # Validate recovered context
    validate_context_integrity
    
    echo "Context recovery completed from: $backup_file"
  else
    echo "❌ Backup file not found: $backup_file"
    return 1
  fi
}
```

#### 2. CONTEXT SYNCHRONIZATION
```typescript
class ContextSynchronizer {
  syncContextAcrossAgents(sourceAgent: string, targetAgent: string): void {
    // Extract context from source agent's artifacts
    const sourceContext = this.extractContextFromArtifacts(sourceAgent);
    
    // Validate context completeness
    const validation = this.validateContextCompleteness(sourceContext);
    
    if (!validation.isComplete) {
      throw new Error(`Context incomplete: ${validation.missingElements.join(', ')}`);
    }
    
    // Package context for target agent
    const contextPackage = this.packageContextForAgent(sourceContext, targetAgent);
    
    // Create handover documentation
    this.createHandoverDocumentation(contextPackage, targetAgent);
    
    // Verify handover success
    this.verifyHandoverSuccess(targetAgent);
  }
  
  detectContextDrift(currentContext: SharedContext, referenceContext: SharedContext): ContextDrift {
    // Compare contexts to identify drift
    // Return specific drift indicators
    // Suggest corrective actions
  }
}
```

## 🎯 SUCCESS METRICS

### CONTEXT PRESERVATION EFFECTIVENESS
- **Zero Context Loss**: 100% of decisions and rationale preserved across agent transitions
- **Complete Traceability**: Every artifact traceable to original requirements
- **Rapid Recovery**: Context fully recoverable from backups within 2 minutes
- **Drift Detection**: Context drift detected within 5 minutes of occurrence

### WORKFLOW CONTINUITY
- **Seamless Handovers**: Agents start with complete understanding of previous work
- **Consistent Quality**: Evidence standards maintained across all agent transitions
- **Decision Auditability**: All stakeholder decisions trackable and reversible
- **Knowledge Retention**: Project knowledge preserved even with agent failures

---
*Shared context preservation ensures workflow continuity and prevents information loss across agent transitions.*