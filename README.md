This project reflects my personal journey as someone who always wanted programming skills to build useful tools but never developed the necessary expertise. AI pair programming has finally made creating usable applications accessible without requiring extensive upfront skill development. However, working with AI LLMs is quirky and difficult because they can completely derail. I'm trying different methods of "guiding," "coaching," "steering," and limiting the LLM. I've had some interesting experiments with RooCode and Cursor using AI roles. Recently I took another shot at it with Claude Code roles. I've packaged the work and put it on GitHub here.
It is not quite where I want it to be yet, but I do see this as one of the viable methods for keeping the LLM on track and it's a nice start. Feel encouraged to use it and I welcome feedback here or you can look me up on LinkedIn: https://www.linkedin.com/in/dimitrigeelen/.

# Claude Code Pair Programming Roles

Is a role-based development framework using evidence-based development principles and specialized AI workflows. This project demonstrates a systematic approach to building software using specialized AI agents for different aspects of development.

This framework is designed to improve AI-human pair programming outcomes by providing structured, evidence-based workflows that reduce frustration and increase productivity through clear role definitions and measurable results.

## How to start 1 ... 2 ... 3 steps

**STEP 1 - clone Repo**

**If you want the repository contents to go directly into your current directory (without creating a subfolder), you can use:**

```bash
git clone https://github.com/DimitriGeelen/1000-AI-Roles.git .
```
The . at the end tells git to clone into the current directory. Note that your current directory should be empty for this to work properly.

**If you want to create a new project folder and clone the repository into it:**

```bash
mkdir my-project && cd my-project && git clone https://github.com/DimitriGeelen/1000-AI-Roles.git .
```

This command does three things in sequence:
1. `mkdir my-project` - Creates a new directory called "my-project"
2. `cd my-project` - Changes into that directory
3. `git clone ... .` - Clones the repository contents directly into the current directory (the dot at the end means "current directory")

Replace `my-project` with whatever you want to name your project folder. The `&&` operators ensure each command only runs if the previous one succeeds.

**STEP 2 - start claude code**

by typing in claude at the command prompt 

or

if you need to install claude first follow the instructions here: https://docs.anthropic.com/en/docs/claude-code/setup
**STEP 3**

**'/' (forward slash) + 'ENTER' in the command prompt, you should now see the avialable roles. You can navigate with the arrow Up/down keys to the roles and then enter to step into the role.**
**You can also type '/roles' + 'ENTER'--> will also show you the available roles or type in teh role directly by '/(RoleName) + 'ENTER'**
**for a new project i suggest to start with the '/project-initiator' role but this is not a requirments**


**p.s. some pointers to deal with quirkiness, aim to refine this a the next release.**

For now, I suggest to skip the architect role unless you wan enterprise grade architecture.

---Architecture bloat: when LLM veers of into architecture bloat use the phase: adhere to our claude.md! --> **Build the minimum first.** Start with the simplest version that could possibly work - strip everything down to just the essential core functionality!

--- Cheating and Lying LLM: When the LLM is faking result and claiming features have been build and successfully tested, use the phrase: adhere to our claude.md! --> **"Show me the data" protocol.** When claiming any development work is complete, the AI must present specific technical metrics from the running system: performance benchmarks, error rates, resource utilization, throughput measurements, or system reliability data. Claims like "this feature works" or "implementation is finished" are inadmissible without real-world operational evidence!

## Evidence-Based Development Principles

- **Human decides, AI provides proof**: Product Owner makes decisions based on concrete, measurable evidence
- **Default to instrumentation**: Every code delivery includes logging, metrics, and monitoring hooks
- **"Show me the data" protocol**: All development work must be backed by real-world operational evidence
- **Build the minimum first**: Start with the simplest version that could possibly work
- **Validate before adding**: Every enhancement must be earned through evidence from real usage

## Role Calling in Claude Code

This project implements a Role-based development system where specialized AI agents handle different aspects of software development. Each role has specific responsibilities, success metrics, and handoff procedures.

### How Role Calling Works

**Agent Invocation Pattern**: When you need specialized expertise, Claude will suggest using a specific agent:
```
Claude: "This project needs clear requirements. I recommend using @requirements-collector to gather your needs first"
User: @requirements-collector
```

## Research Findings: @role Pattern Implementation

During development of this role-based system, we researched Claude Code's native capabilities for role invocation patterns and discovered important insights:

### Key Findings

1. **@role Pattern Not Native**: The `@role` invocation pattern described in our CLAUDE.md is a custom specification that doesn't align with Claude Code's standard functionality.

2. **Claude Code Native Patterns**:
   - **Slash Commands**: `/command-name` format using `.md` files in `.claude/commands/` directory
   - **File Tagging**: `@filename` for referencing files and context inclusion
   - **Sub-Agent Tasks**: Uses `Task` tool to spawn specialized autonomous agents

3. **Alternative Implementation Options**:
   - **Option A**: Convert each role to individual slash commands (e.g., `/requirements-collector`)
   - **Option B**: Create a `/roles` command that lists all available development roles
   - **Option C**: Implement as workflow documentation that Claude follows contextually

### Current Implementation

This project now implements **both approaches**:

**Slash Commands (Recommended)**:
- Individual role commands: `/project-initiator`, `/requirements-collector`, `/mvp-specialist`, `/architect`, etc.
- Role listing command: `/roles` to see all available roles
- Located in `.claude/commands/` directory for native Claude Code support

**Contextual Workflow Guidance (Fallback)**:
- Claude recognizes role requests based on CLAUDE.md instructions  
- Roles can be invoked through natural language (e.g., "I need the requirements collector role")
- Each role follows its defined custom instructions and success metrics

### Recommended Future Enhancements

1. ✅ **Create Slash Commands**: ~~Implement `.claude/commands/` directory with individual role commands~~ **COMPLETED**
2. **MCP Integration**: Potentially integrate with Model Context Protocol for advanced agent orchestration
3. **Workflow Automation**: Build automated handoff procedures between roles using Claude Code's Task delegation

This hybrid approach maintains the sophisticated role-based development system while working within Claude Code's architectural constraints.

## Getting Started

### Using Slash Commands (Recommended)

1. **Clone the repository** - The `.claude/commands/` directory contains all role definitions
2. **List available roles**: Type `/roles` to see all available development roles
3. **Start with discovery**: Use `/project-initiator` to transform ideas into actionable project briefs
4. **Gather requirements**: Use `/requirements-collector` to gather comprehensive needs
5. **Define MVP scope**: Use `/mvp-specialist` to focus on core value proposition  
6. **Design architecture**: Use `/architect` to create technical system design
7. **Plan implementation**: Use `/planner` to break down into executable tasks
8. **Implement with evidence**: Follow the chain `/pseudo-coder` → `/tdd-evidence-specialist` → `/coder`

#### Troubleshooting Slash Commands

If slash commands aren't working (e.g., `/roles` shows `/permissions` instead):

**Common Solutions:**
1. **Verify working directory**: Ensure you're in the project root directory (`/opt/1000-AI-Roles`)
2. **Check command discovery**: Type just `/` to see if any commands load in the typeahead menu
3. **Restart Claude session**: Use `/clear` to refresh the session and reload commands
4. **Try permissions workaround**: Run `claude --dangerously-skip-permissions` (not actually dangerous)
5. **Verify file structure**: Commands should be `.md` files in `.claude/commands/` directory

**Known Issues:**
- Claude may not recognize dot-directories (`.claude`) intermittently ([Issue #697](https://github.com/anthropics/claude-code/issues/697))
- Commands may need session restart to be discovered
- Editing commands within a session should update them automatically

**Verification Steps:**
- Commands should appear in typeahead when typing `/`
- Check that `.claude/commands/` contains the 10 `.md` files
- Ensure repository is committed (commands need to be tracked files)

*Sources: [Claude Code Issues](https://github.com/anthropics/claude-code/issues/697), [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)*

### Using Natural Language (Fallback)

1. **Start with discovery**: "I need the project initiator role" to transform ideas into project briefs
2. **Gather requirements**: "I need the requirements collector role" to gather comprehensive needs
3. **Define MVP scope**: "Use the mvp specialist role" to focus on core value proposition
4. **Design architecture**: "I need the architect role" to create technical system design
5. **Plan implementation**: "Use the planner role" to break down into executable tasks
6. **Implement with evidence**: Follow the implementation chain with corresponding role requests

## Project Structure

```
├── CLAUDE.md                    # Claude Code guidance and project instructions
├── AI-Roles.md                  # Complete role definitions and custom instructions  
├── README.md                    # This file - project overview and role calling guide
├── core-principles.md           # Core development principles
└── .claude/
    └── commands/                # Slash command definitions
        ├── roles.md             # List all available roles (/roles)
        ├── project-initiator.md        # Project discovery specialist (/project-initiator)
        ├── requirements-collector.md    # Requirements specialist (/requirements-collector)
        ├── mvp-specialist.md           # MVP strategist (/mvp-specialist)
        ├── architect.md                # Solution architect (/architect)
        ├── planner.md                  # Task planner (/planner)
        ├── pseudo-coder.md             # Logic designer (/pseudo-coder)
        ├── tdd-evidence-specialist.md  # TDD specialist (/tdd-evidence-specialist)
        ├── coder.md                    # Code implementer (/coder)
        ├── documentation-writer.md     # Documentation specialist (/documentation-writer)
        └── git-mate.md                 # Git workflow specialist (/git-mate)
```

## Documentation

All project documentation follows version control with structured tracking:

| File | Purpose | Version |
|------|---------|---------|
| CLAUDE.md | Claude Code guidance and workflow | 1.1 |
| AI-Roles.md | Role-based development system | 1.0 |
| README.md | Project overview and role calling | 1.0 |
| core-principles.md | Development principles | 1.0 |

## Contributing

This project follows evidence-based development principles. All contributions must include:
- Measurable success criteria
- Operational validation strategy  
- Real-world system behavior evidence
- Comprehensive test coverage

For more details, see `CLAUDE.md` for complete development workflow and `AI-Roles.md` for role-specific instructions.
