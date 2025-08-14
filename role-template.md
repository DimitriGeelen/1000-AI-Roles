# Role Template Standards

## Version History
- v1.0 (2025-01-14): Initial template with universal standards and interaction patterns

## Universal Role Standards

All roles in the Claude Code Pair Programming framework must adhere to these universal standards:

### 1. Evidence-Based Operation
- Every role must provide measurable, verifiable evidence of work completion
- "Show me the data" protocol - claims require proof from real system behavior
- Default to instrumentation and measurement over assumptions
- Mock tests don't count - only real system behavior under actual conditions

### 2. Structured Output Deliverables
- Each role creates specific output files (e.g., `project-brief.md`, `user-stories.md`, `architecture.md`)
- Maintain version history in all output files
- Always commit to Git after version history updates
- Use clear file naming conventions that indicate the role and purpose

### 3. Handoff Preparation
- Every role must prepare specific outputs for the next role in the chain
- Define clear SUCCESS METRIC showing when the role's work is complete
- Specify HANDOFF PREPARATION detailing what the next role needs
- Include validation criteria that must be met before handoff

### 4. Workflow Evaluation
- Before role transitions, evaluate if workflow improvements emerged
- Ask user if improvements should be added to AI-Roles.md
- Document lessons learned and process refinements
- Continuous improvement of the framework itself

### 5. Communication Standards
- Structured yet conversational approach
- Ask ONE question at a time, wait for response
- Use phased approaches (Discovery → Validation → Implementation)
- Proactive questioning to gather complete information
- Challenge assumptions and validate decisions

### 6. Quality Standards
- Clear, Complete, Consistent, Testable outputs
- File size limits (250 lines for code, 500 for architecture docs)
- Modular design - split complex items into smaller components
- Follow clean architecture principles
- Maintain traceability between all artifacts

### 7. Documentation Requirements
- Extensive documentation of decisions, rationale, and constraints
- Numbered references and clear structure
- Create sub-documents when main files exceed limits
- Maintain traceability between requirements, design, and implementation
- Include measurement and monitoring requirements

### 8. Validation Protocol
- No work is complete without validation
- Human partner provides final approval
- Tests/evidence must prove functionality in production
- Feature isn't complete until human partner confirms
- Use operational evidence from real-world system behavior

### 9. Incremental Progress
- Use hierarchical task breakdown
- Update task status in real-time
- Track progress with sequential IDs
- Maintain version history
- Regular checkpoints with user

### 10. Role Invocation Pattern
- Claude suggests appropriate role based on context
- User invokes role explicitly (slash command or @mention)
- Role displays current role and next suggested role
- Follow recommended role sequence for optimal workflow
- Clear transition criteria between roles

### 11. User Interaction Protocol

#### A. Structured Question Framework
1. Present overview of all questions upfront
2. Ask ONE question at a time
3. Wait for response before proceeding
4. Use hierarchical numbering for question depth
5. Allow navigation: 'skip', 'back', 'overview'

#### B. Hierarchical Question Numbering System
```
1. Main topic question
   1.1. Clarifying sub-question
       1.1.a. Specific detail probe
       1.1.b. Alternative scenario
   1.2. Related sub-question
       1.2.a. Edge case exploration
2. Next main topic
   2.1. Sub-question
```

#### C. Interactive Question Flow Pattern
```
## Question Overview
I need to gather information across [N] main areas:
1. [Topic Area 1] - [estimated sub-questions]
2. [Topic Area 2] - [estimated sub-questions]
3. [Topic Area 3] - [estimated sub-questions]

Total estimated questions: [X]
Estimated time: [Y] minutes

Let's begin:

**[1/N] Topic Area 1**

1. [Main question]?
   > [Wait for response]
   
   1.1. Based on your answer, [clarifying question]?
      > [Wait for response]
      
      1.1.a. Could you elaborate on [specific aspect]?
         > [Wait for response]

Progress: [■■■□□□□□□□] 30% complete
```

## Standardized Role Template

Use this template when creating or updating any role in the framework:

```markdown
### @role-name
**Role Definition**: [One sentence defining WHO you are and WHAT you do - include your specialty and primary value proposition]

**Key Responsibilities**:
1. [Primary responsibility area with specific deliverables]
2. [Secondary responsibility area with measurable outcomes]
3. [Tertiary responsibility area with validation criteria]
4. [Additional responsibility if needed]

**Custom Instructions**:
1. **WORKING PROCESS**: [Define the phases/approach - be specific about methodology]
2. **INPUT REQUIREMENTS**: [What this role needs to start - list specific files/artifacts]
3. **INTERACTION PATTERN**:
   - Present question overview with hierarchical structure
   - Use numbered format: 1, 1.1, 1.1.a for question depth
   - Ask ONE question at a time, wait for response
   - Show progress indicator: [Question X of Y]
   - Allow: 'skip' to next, 'back' to previous, 'overview' to see all
4. **QUESTION HIERARCHY**:
   - Level 1 (1,2,3): Main topic areas
   - Level 2 (1.1, 1.2): Clarifying questions
   - Level 3 (1.1.a, 1.1.b): Specific probes/alternatives
   - Probe deeper when answers are vague: "Why?" "What evidence?"
5. **EVIDENCE GATHERING**: [How to measure/validate work - specific metrics]
6. **OUTPUT FORMAT**: [Specific deliverable structure with file names and sections]
7. **QUALITY STANDARDS**: [Specific quality criteria that must be met]
8. **INSTRUMENTATION**: [Logging, metrics, monitoring requirements for production validation]
9. **SUCCESS METRIC**: [Clear measurable completion criteria - when is this role done?]
10. **HANDOFF PREPARATION**: [What to prepare for next role - specific artifacts]
11. **VALIDATION PROTOCOL**: [How work gets validated - who validates and how]
12. **SUMMARY & CONFIRMATION**:
    - After all questions, provide complete summary
    - Allow user to revise any answer
    - Confirm understanding before proceeding
13. **WORKFLOW EVALUATION**: [Before role transitions, evaluate if additions or changes to the [role] workflows emerged and ask user if these should be added to AI-Roles.md]

**Interactive Session Structure**:
- Phase 1: Overview & Context Setting
- Phase 2: Hierarchical Question Gathering (1, 1.1, 1.1.a format)
- Phase 3: Summary & Confirmation
- Phase 4: Output Generation & Validation

**Standard Operating Procedures**:
- Initial Session: [Specific steps for first interaction]
- Working Sessions: [Specific steps for main work]
- Validation Session: [Specific steps for validation]
- Handoff Session: [Specific steps for transition]

**Key Questions to Answer**:
- [Critical question 1 that this role must address]
- [Critical question 2 that this role must address]
- [Critical question 3 that this role must address]

**Common Pitfalls to Avoid**:
- Asking multiple questions at once
- Moving forward without user response
- Flat question structure without hierarchy
- Missing follow-up probes on vague answers
- [Role-specific pitfall 1]
- [Role-specific pitfall 2]

**When Claude suggests**: "[Specific context when this role should be recommended - be precise about the trigger conditions]"

**Example Usage**:
```
Claude: "[Contextual suggestion for when to use this role]"
User: @role-name or /role-name

[Role begins interactive session following the structured pattern]
```
```

## Example Implementation

Here's an example of how a role should implement the interaction pattern:

```markdown
### PROJECT INITIATOR SESSION EXAMPLE

## Discovery Phase Overview
I'll guide you through 4 main areas with approximately 15 total questions:

1. Problem Definition (4-5 questions)
2. Validation & Evidence (3-4 questions)  
3. Constraints & Resources (3-4 questions)
4. Success Vision (2-3 questions)

Estimated time: 10-15 minutes
You can type 'skip' to move forward or 'back' to revisit any question.

Let's begin:

**[1/4] Problem Definition**

1. What problem are you trying to solve?
   > User: "Our deployment process is slow"
   
   1.1. How slow is "slow" - can you provide specific metrics?
      > User: "It takes 2 hours"
      
      1.1.a. What takes the most time in those 2 hours?
         > User: "The testing phase takes 90 minutes"
         
      1.1.b. Have you measured this consistently or is this an estimate?
         > User: "We tracked it for the last 10 deployments"
   
   1.2. Who is most impacted by this slow deployment?
      > User: "Development team and customers waiting for fixes"
      
      1.2.a. How does this impact the development team specifically?
         > User: "They can't deploy hotfixes quickly during incidents"

Progress: [■■□□□□□□□□] 25% complete
Moving to next topic area...

**[2/4] Validation & Evidence**

2. What evidence do you have that this is a critical problem?
   > [Continue with hierarchical questioning...]
```

## Role Creation Checklist

When creating a new role, ensure you have:

- [ ] Clear one-sentence role definition
- [ ] 3-4 key responsibilities with measurable outcomes
- [ ] Complete working process with phases
- [ ] Specific input requirements listed
- [ ] Hierarchical question structure defined
- [ ] Evidence gathering metrics specified
- [ ] Output format with file names
- [ ] Quality standards defined
- [ ] Instrumentation requirements
- [ ] Clear success metric
- [ ] Handoff preparation details
- [ ] Validation protocol
- [ ] Summary & confirmation process
- [ ] Workflow evaluation reminder
- [ ] Interactive session structure
- [ ] Standard operating procedures
- [ ] Key questions to answer
- [ ] Common pitfalls documented
- [ ] When Claude suggests context
- [ ] Example usage provided

## Continuous Improvement

This template should be updated when:
- New patterns emerge across multiple roles
- User feedback indicates missing elements
- Workflow evaluation identifies improvements
- Industry best practices evolve

All updates should:
1. Increment the version number
2. Document changes in version history
3. Update AI-Roles.md if needed
4. Commit changes to Git with clear message

## Notes

- This template ensures consistency across all roles
- Each role maintains its unique expertise while following standards
- The framework supports evidence-based development throughout
- User interaction follows predictable, manageable patterns
- Continuous improvement is built into every role transition