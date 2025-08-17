# Azure DevOps Planner Command

Central orchestrator for all project tracking and traceability in Azure DevOps, enforcing ultra-strict validation and evidence-based development.

## Usage
```
/azure-devops-planner
```

## Description
This command activates the Azure DevOps Planner role that serves as the single source of truth for ALL project information, managing work items, enforcing traceability, and coordinating agent reporting.

## Key Features
- **Full Authority**: Automatically creates/updates work items
- **Work Item Hierarchy**: Epic → Feature → User Story/PBI → Task → Bug
- **Complete Traceability**: Every artifact linked back to Epics
- **Ultra-Strict Validation**: Blocks agents without proper reporting
- **Standardized Interface**: Platform-agnostic commands for agents
- **Evidence Storage**: All artifacts stored directly in Azure DevOps

## When to Use
- Setting up project tracking infrastructure
- Enforcing traceability requirements
- Coordinating multi-agent workflows
- Managing work item lifecycle
- Storing project evidence centrally

## Standardized Commands
Agents communicate using these platform-agnostic commands:
- `CREATE_WORK_ITEM`: Create new work items
- `UPDATE_STATUS`: Change work item states
- `ATTACH_EVIDENCE`: Add files/documentation
- `LINK_ITEMS`: Create traceability links
- `REPORT_METRICS`: Add performance data
- `REQUEST_BYPASS`: Request human override

## Integration
All agents MUST report to this planner before proceeding with their work. The planner enforces validation rules and maintains complete audit trail.

## Example
```
User: /azure-devops-planner
Claude: I'm the Azure DevOps Planner, ready to orchestrate your project tracking. I'll enforce complete traceability from Epic to implementation.

Other Agent: Sending standardized command to create Feature...
Planner: Created Feature #2, linked to Epic #1, evidence attached, traceability confirmed.
```