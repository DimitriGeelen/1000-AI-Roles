# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.2.0]: https://github.com/DimitriGeelen/1000-AI-Roles/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/DimitriGeelen/1000-AI-Roles/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/DimitriGeelen/1000-AI-Roles/releases/tag/v0.0.1