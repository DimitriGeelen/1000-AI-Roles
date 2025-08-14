# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Azure DevOps Agent** (`/azure-devops-agent`) - New DevOps & Infrastructure agent
  - Autonomous CI/CD specialist for Azure DevOps pipelines
  - Creates, manages, and executes pipelines through programmatic interfaces
  - Analyzes requirements to design optimal CI/CD workflows with measurable success rates
  - Configures build/test/deployment tasks with performance benchmarks
  - Implements monitoring, security gates, and Infrastructure as Code integration
  - Output: `azure-pipelines.yml`, `pipeline-config.md`, monitoring dashboards
- **Role Template Standards** (`role-template.md`) - Standardized template for all roles
  - Universal role standards with 11 key requirements
  - Hierarchical question numbering system (1, 1.1, 1.1.a format)
  - Interactive session structure with 4 phases
  - Standard operating procedures and validation protocols
  - Role creation checklist and continuous improvement guidelines

### Changed
- **All 10 existing roles migrated** to comply with standardized template
  - Added hierarchical interaction patterns to all roles
  - Enhanced with interactive session structures and standard operating procedures
  - Improved with summary & confirmation processes and example usage
  - Added instrumentation requirements and progress tracking
- **TDD Evidence Specialist enhanced** with Triple A Pattern (Arrange-Act-Assert)
  - Added comprehensive Triple A pattern structure for all tests
  - Integrated Assert-First TDD technique for outcome-driven test design
  - Enhanced evidence template structure (EVIDENCE/ARRANGE/ACT/ASSERT)
  - Added critical anti-patterns to avoid (Multiple AAA sections, Multiple assertions, etc.)
  - Improved working process with assert-first design approach
  - Updated quality standards to enforce Triple A compliance and single responsibility
- **Documentation registry updated** in CLAUDE.md with role-template.md entry
- **Role listings updated** in `.claude/commands/roles.md` with new DevOps & Infrastructure section

## [0.2.2] - 2025-07-26

### Changed
- Enhanced git-mate role documentation with complete release workflow
  - Added 9-step standard release process
  - Added version decision guide (PATCH/MINOR/MAJOR criteria)
  - Added release options template (A/B/C choices)
  - Added GitHub release template with structured format

## [0.2.1] - 2025-07-26

### Fixed
- Added missing Project Initiator role documentation to README
  - Now properly listed in slash commands examples
  - Added as first step in Getting Started workflow
  - Included in Natural Language usage examples
  - Added to project structure file listing

## [0.2.0] - 2025-07-26

### Added
- **Structured Interaction Pattern** in CLAUDE.md for consistent user questioning approach
  - Question listing phase with unique identifiers (Q1, Q2, etc.)
  - Iterative one-by-one questioning with progress tracking
  - Summary phase with revision options
- **Current Role Display** requirement for all roles to show active role and next suggestion
- **User Approval Requirements** for all 10 role command files
  - Mandatory approval before starting any work
  - Clear explanation of planned activities
  - "Type 'go' to proceed" confirmation pattern
- **Enhanced Git Mate** with repository detection and management options
  - Detects existing repositories and remotes
  - Provides options: push to current, create branch, or new repo
  - Smart branch and repository naming suggestions
- **Enhanced TDD Evidence Specialist** with strict completion requirements
  - 100% test completion enforcement (no skipping allowed)
  - "Show Me The Data" protocol with concrete metrics
  - Comprehensive failure handling and user reporting
- **Enhanced Architect** with three architecture approach options
  - Option A: Minimal Architecture First
  - Option B: Iterative Architecture with user interaction
  - Option C: Enterprise Grade Architecture
- **Project Initiator** role for transforming ideas into actionable project briefs

### Changed
- Updated documentation registry in CLAUDE.md to reflect actual files
- Enhanced all role command files with user approval sections
- Improved role workflow documentation with clearer progression

### Fixed
- Removed reference to non-existent AI-Roles-Claude-Agents.md
- Corrected documentation registry entries

## [0.1.0] - 2025-07-22

### Added
- Role-based development system with 10 specialized agents
- Claude Code slash command integration via `.claude/commands/` directory
- Foundation agents: Requirements Collector, MVP Specialist, Architect, Planner
- Implementation agents: Pseudo Coder, TDD Evidence Specialist, Coder
- Support agents: Documentation Writer, Git Mate
- Comprehensive project documentation in CLAUDE.md with workflow guidelines
- Documentation registry tracking all markdown files
- README with project overview and role usage instructions
- Evidence-based development principles with "Human decides, AI provides proof" methodology
- Semantic versioning with VERSION file and changelog maintenance

### Changed
- Updated CLAUDE.md with enhanced workflow documentation and file registry
- Improved project structure with proper role-based organization

## [0.0.1] - 2025-07-22

### Added
- Initial project setup for role-based development framework
- Basic project foundation and Git repository initialization

[0.2.2]: https://github.com/DimitriGeelen/1000-AI-Roles/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/DimitriGeelen/1000-AI-Roles/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/DimitriGeelen/1000-AI-Roles/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/DimitriGeelen/1000-AI-Roles/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/DimitriGeelen/1000-AI-Roles/releases/tag/v0.0.1