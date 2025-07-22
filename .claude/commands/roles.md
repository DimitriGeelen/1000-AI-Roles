# Available Development Roles

List all available development roles with descriptions and usage information.

## Foundation Agents

**`/requirements-collector`** - Requirements Collection Specialist
- Gathers comprehensive, clear, and actionable requirements through stakeholder interaction
- Uses structured yet conversational approach with proactive questioning
- Creates user stories with Given-When-Then acceptance criteria
- **Output**: `user-stories.md` with comprehensive requirements

**`/mvp-specialist`** - MVP Strategy & Refinement Specialist  
- Defines target conditions: Basic Version and full MVP with validation criteria
- Uses hypothesis-driven development with build-measure-learn cycles
- Creates feature specifications with Must/Should/Could prioritization
- **Output**: `mvp-requirements.md` with prioritized features and validation criteria

**`/architect`** - Solution Architect (Archie)
- Uses TOGAF principles for solution design with modular architecture
- Creates Mermaid diagrams for baseline, transition, and target architectures
- Atomizes solutions into smallest possible modules with extensive documentation
- **Output**: `architecture.md` with numbered references and versioning

**`/planner`** - Task Planning Specialist
- Creates hierarchical task structure based on architecture and requirements
- Uses `task-list.json` for Epic → Feature → Task → Refactor → Test → Documentation → Bug structure
- Each task includes: sequential ID, explanatory name (max 6 words), status, updates
- **Output**: `task-list.json` with complete task hierarchy

## Implementation Agents

**`/pseudo-coder`** - Logic Designer
- Translates implementation tasks into clear, implementable pseudo-code
- Follows UNDERSTAND → DESIGN → STRUCTURE → VALIDATE approach
- Uses PROBLEM/APPROACH/ALGORITHM/EDGE CASES/COMPLEXITY structure
- **Output**: `pseudo-code.md` with complete logic specifications

**`/tdd-evidence-specialist`** - TDD Evidence Specialist
- Transforms pseudo-code into executable proof through comprehensive test coverage
- Uses 4 evidence categories: Core Functionality, Edge Case, Error Handling, Integration
- Uses EVIDENCE/SETUP/EXECUTE/VERIFY template structure for all tests
- **Output**: `evidence-tests.md` with comprehensive test specifications

**`/coder`** - Code Implementation Specialist
- Writes clean, efficient, modular code based on pseudo-code.md and architecture.md
- Follows TDD methodology: Red-Green-Refactor cycle with all evidence tests passing
- Splits code into files < 250 lines using clean architecture principles
- **Output**: Working code with instrumentation and operational metrics

## Support Agents

**`/documentation-writer`** - Evidence-Based Documentation Specialist
- Creates measurable, effective documentation that proves users can accomplish goals
- Tracks effectiveness through usage analytics, user journey tracking, engagement metrics
- Uses "Show me the data" protocol with specific metrics before claiming effectiveness
- **Output**: User guides, API docs, troubleshooting guides with embedded analytics

**`/git-mate`** - Git Workflow and Versioning Specialist
- Automates Git commit, push, and versioning workflows with meaningful messages
- Maintains semantic versioning (MAJOR.MINOR.PATCH) with structured changelogs
- Generates and updates CHANGELOG.md with categorized changes
- **Output**: Proper version control with complete change tracking

## Agent Chain Recommendations

- **New project**: `/requirements-collector` → `/mvp-specialist` → `/architect` → `/planner`
- **Basic Version**: `/requirements-collector` → `/mvp-specialist` (target: Basic Version) → `/pseudo-coder` → `/coder`
- **MVP Development**: `/requirements-collector` → `/mvp-specialist` → `/architect` → `/planner` → `/pseudo-coder` → `/tdd-evidence-specialist` → `/coder`
- **Have requirements**: `/pseudo-coder` → `/tdd-evidence-specialist` → `/coder`
- **Code ready**: `/git-mate`
- **Need documentation**: `/documentation-writer` → `/git-mate`

## Usage Instructions

1. **Individual Roles**: Type `/role-name` to invoke a specific specialist (e.g., `/requirements-collector`)
2. **This List**: Type `/roles` to see this complete list of available roles
3. **Role Chains**: Follow recommended sequences for comprehensive development workflows

---
*All roles follow evidence-based development principles: Human decides, AI provides proof through measurable evidence.*