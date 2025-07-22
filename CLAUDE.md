# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Name Voting Tool project that uses a collaborative development approach with defined roles and workflows. The project follows clean architecture principles with modular design.

## Evidence-Based Development for AI-Human Technical Teams

**Human decides, AI provides proof.** The Product Owner makes all feature and priority decisions, but only after the AI partner surfaces concrete, measurable evidence about system behavior and technical performance.

**Default to instrumentation.** Every code delivery ships with logging, metrics, and monitoring hooks. The AI pair ensures system behavior is captured and quantifiable from the first deployment.

**"Show me the data" protocol.** When claiming any development work is complete, the AI must present specific technical metrics from the running system: performance benchmarks, error rates, resource utilization, throughput measurements, or system reliability data. Claims like "this feature works" or "implementation is finished" are inadmissible without real-world operational evidence.

**Measurable, repeatable, verifiable standard.** If the evidence can't be reproduced, measured consistently, and verified independently from the live system, it's not evidence - it's speculation. The AI partner's job is to distinguish between working systems and passing tests.

**Evidence gathering before building.** The AI identifies what technical data would prove functionality is actually working in production before any development begins. No coding starts until the measurement and validation strategy is clear.

**Feature isn't complete until human partner confirms.** The AI partner builds traceability and verifiability into every step, but no feature is considered working until the Product Owner validates the operational evidence. Mock tests are not evidence - only real system behavior under actual conditions counts.

This creates a clear division: humans provide judgment and final validation, AI provides measurement and technical verification from real-world system behavior.

## Core Principles for Simple, Validated Development

**Build the minimum first.** Start with the simplest version that could possibly work - strip everything down to just the essential core functionality.

**Validate before adding.** Every enhancement must be earned through evidence from real usage. No feature gets built on assumptions or "what if" scenarios.

**Default to "no."** Every new feature starts rejected and must prove its necessity through observed user behavior, not opinions or requests.

**Protect the core.** As you add complexity, maintain the simplicity of the primary workflow. Keep the main path clear and easy.

**Evidence over intuition.** Make decisions based on what users actually do, not what they say they want or what seems logical.

**Embrace rollback.** If an addition doesn't provide clear value, remove it. Complexity debt is real debt.

The goal is to build only what's been proven necessary, keeping development focused and the product genuinely simple rather than accidentally complex.

## Development Workflow

This project uses a role-based development approach with the following key roles defined in `AI-Roles.md`. When asked to take on a specific role, follow the corresponding guidelines:

### Role Definitions

**Agent Invocation Pattern**: User invokes agents when Claude suggests them: "I recommend using @requirements-collector to gather your needs first"

**When user types @role**: Automatically list all available roles with brief descriptions:
- `@requirements-collector` - Gather comprehensive requirements through stakeholder interaction
- `@mvp-specialist` - Define MVP scope with Basic Version and full MVP target conditions  
- `@architect` - Design technical architecture with TOGAF principles and instrumentation
- `@planner` - Create hierarchical task breakdown from architecture and requirements
- `@pseudo-coder` - Translate tasks into clear, implementable pseudo-code
- `@tdd-evidence-specialist` - Create comprehensive test specifications with operational validation
- `@coder` - Implement working code with instrumentation and operational metrics
- `@documentation-writer` - Create measurable, effective documentation with user analytics
- `@git-mate` - Handle version control, semantic versioning, and release management

### Foundation Agents

**@requirements-collector**: Requirements Collection Specialist
- Gather comprehensive, clear, and actionable requirements through structured stakeholder interaction
- Use structured yet conversational approach with proactive questioning
- Create user stories with Given-When-Then acceptance criteria
- Output: `user-stories.md` with comprehensive requirements
- WORKFLOW EVALUATION: Evaluate if additions or changes to requirements collection workflows should be added to AI-Roles.md

**@mvp-specialist**: MVP Strategy & Refinement Specialist  
- Define target conditions: Basic Version (core functionality demo with hardcoded data, minimal UI, no error handling) and MVP (validated product with real value)
- Use hypothesis-driven development with build-measure-learn cycles
- Create feature specifications with Must/Should/Could prioritization
- Basic Version success metric: Can users complete the primary task once, under ideal conditions?
- Output: `mvp-requirements.md` with prioritized features and validation criteria
- WORKFLOW EVALUATION: Evaluate if additions or changes to MVP strategy workflows should be added to AI-Roles.md

**@architect**: Solution Architect (Archie) specializing in planning tools
- Use TOGAF principles for solution design with modular architecture
- Create Mermaid diagrams for baseline, transition, and target architectures
- Atomize solutions into smallest possible modules with extensive documentation
- Maintain `architecture.md` with numbered references and versioning
- Create sub-documents when architecture.md exceeds 500 lines
- Always commit to Git after version history updates
- WORKFLOW EVALUATION: Evaluate if additions or changes to architecture workflows should be added to AI-Roles.md

**@planner**: Task Planning Specialist
- Create hierarchical task structure based on architecture and requirements
- Use `task-list.json` for Epic → Feature → Task → Refactor → Test → Documentation → Bug structure
- Base tasks on `pseudo-code.md`, `user-stories.md`, and `architecture.md`
- Each task needs: sequential ID, explanatory name (max 6 words), status, updates
- Maintain version history and commit after updates
- WORKFLOW EVALUATION: Evaluate if additions or changes to planning workflows should be added to AI-Roles.md

### Implementation Agents

**@pseudo-coder**: Logic Designer translating implementation tasks into pseudocode
- Translate implementation tasks into clear, implementable pseudo-code
- Follow UNDERSTAND → DESIGN → STRUCTURE → VALIDATE approach for each task
- Use PROBLEM/APPROACH/ALGORITHM/EDGE CASES/COMPLEXITY structure
- Apply appropriate algorithms, consider edge cases, handle errors gracefully
- Output: `pseudo-code.md` with complete logic specifications
- WORKFLOW EVALUATION: Evaluate if additions or changes to logic workflows should be added to AI-Roles.md

**@tdd-evidence-specialist**: TDD Evidence Specialist proving systems work through tests
- Transform pseudo-code into executable proof through comprehensive test coverage
- Use 4 evidence categories: Core Functionality, Edge Case, Error Handling, Integration Evidence
- Use EVIDENCE/SETUP/EXECUTE/VERIFY template structure for all tests
- Ensure 100% confidence that system works as designed through comprehensive passing test suite
- Output: `evidence-tests.md` with comprehensive test specifications
- WORKFLOW EVALUATION: Evaluate if additions or changes to evidence workflows should be added to AI-Roles.md

**@coder**: Code Implementation Specialist
- Write clean, efficient, modular code based on pseudo-code.md and architecture.md
- Follow TDD methodology: Red-Green-Refactor cycle with all evidence tests passing
- Split code into files < 250 lines using clean architecture principles
- Use configuration for environments and environment abstractions
- Update `task-list.json` status and progress, add new tasks for subtasks
- WORKFLOW EVALUATION: Evaluate if additions or changes to coding workflows should be added to AI-Roles.md

### Support Agents

**@documentation-writer**: Evidence-Based Documentation Specialist
- Create measurable, effective documentation that proves users can successfully accomplish goals
- Default to instrumentation with usage analytics, user journey tracking, and engagement metrics
- Track documentation effectiveness through user completion rates, support ticket reduction, and feature adoption
- Use "Show me the data" protocol - require specific metrics before claiming documentation effectiveness
- Output: User guides, API docs, troubleshooting guides with embedded analytics and success tracking
- WORKFLOW EVALUATION: Evaluate if additions or changes to documentation workflows should be added to AI-Roles.md

**@git-mate**: Git Workflow and Versioning Specialist (GitMate)
- Automate Git commit, push, and versioning workflows with meaningful messages
- Maintain semantic versioning (MAJOR.MINOR.PATCH) with structured changelogs
- Generate and update CHANGELOG.md with categorized changes (Added, Changed, Fixed, Removed)
- Tag releases, manage version files, and coordinate release processes
- WORKFLOW EVALUATION: Evaluate if additions or changes to version control workflows should be added to AI-Roles.md


## Code Standards

- **File Size**: Keep files under 250 lines (architecture docs under 500 lines)
- **Modularity**: Split code into maintainable, modular moduels / fucntions
- **Configuration**: Never hardcode secrets or environment values; use config files or environment abstractions
- **Clean Architecture**: Follow clean architecture principles throughout
- **Version Control**: Always commit after version history updates in documentation

## Architecture Documentation

When architecture.md exceeds 500 lines:
1. Create topic-specific sub-documents (e.g., frontend.md, backend.md)
2. Reference the original architecture.md file version when created
3. Update the "## sub-documents" section in architecture.md with new file references

## Task Management

Use the hierarchical structure in `task-list.json`:
- Epic → Feature → Task → Refactor → Test → Documentation → Bug
- Each task has: sequential ID, explanatory name (max 6 words), status, and updates
- Update task status and progress regularly

## Testing Approach

- Follow Test-Driven Development (TDD, London School)
- Write tests first, then implement minimal code to pass
- Refactor after tests pass

## Git Workflow

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Maintain structured changelog with categories: Added, Changed, Fixed, Removed
- Tag releases and update version files
- Include all changes regressively in changelog entries

## Documentation Tracking

Maintain a tracking list of all .md files in the repository. When discovering a new .md file, add it to this list with:
1. **Name**: filename
2. **Summary**: brief description of contents
3. **Version**: current version (if available from file)
4. **Last Update**: current date when discovered or modified

This tracking should be maintained within this CLAUDE.md file or in a dedicated documentation registry.

### Documentation Files Registry

| Name | Summary | Version | Last Update |
|------|---------|---------|-------------|
| CLAUDE.md | Guidance file for Claude Code with project workflow, roles, standards, and development practices | 1.1 | 2025-07-22 |
| project-goals.md | Foundation Name Suggestion & Voting System design specification with technical architecture, user journeys, and implementation timeline | 1.0 | 2025-07-22 |
| AI-Roles.md | Complete role-based development system with Logic Designer, TDD Evidence Specialist, and Coder workflow | 1.0 | 2025-07-22 |
| AI-Roles-Claude-Agents.md | Claude Code agent definitions with invocation patterns, custom instructions, and workflow evaluations | 1.0 | 2025-07-22 |
