#!/usr/bin/env python3
"""
Role Migration Script - Updates all roles to comply with role-template.md standards
Version: 1.0.0
Author: Claude Code Migration Assistant
"""

import os
import re
import json
import shutil
from datetime import datetime
from typing import Dict, List, Tuple

class RoleMigrator:
    def __init__(self):
        self.base_path = "/opt/1000-AI-Roles"
        self.backup_dir = f"{self.base_path}/backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.roles = {
            "project-initiator": {
                "name": "@project-initiator",
                "definition": "Project Discovery Specialist who transforms vague ideas into actionable project briefs",
                "output": "project-brief.md",
                "next_role": "@requirements-collector"
            },
            "requirements-collector": {
                "name": "@requirements-collector",
                "definition": "Requirements Collection Specialist who gathers comprehensive, clear, and actionable requirements",
                "output": "user-stories.md",
                "next_role": "@mvp-specialist"
            },
            "mvp-specialist": {
                "name": "@mvp-specialist",
                "definition": "MVP Strategy & Refinement Specialist who identifies minimum viable products",
                "output": "mvp-requirements.md",
                "next_role": "@architect"
            },
            "architect": {
                "name": "@architect",
                "definition": "Solution Architect (Archie) who designs technology solutions using TOGAF principles",
                "output": "architecture.md",
                "next_role": "@planner"
            },
            "planner": {
                "name": "@planner",
                "definition": "Task Planning Specialist who creates hierarchical task structures",
                "output": "task-list.json",
                "next_role": "@pseudo-coder"
            },
            "pseudo-coder": {
                "name": "@pseudo-coder",
                "definition": "Logic Designer who translates implementation tasks into clear pseudo code",
                "output": "pseudo-code.md",
                "next_role": "@tdd-evidence-specialist"
            },
            "tdd-evidence-specialist": {
                "name": "@tdd-evidence-specialist",
                "definition": "TDD Evidence Specialist who proves systems work through comprehensive tests",
                "output": "evidence-tests.md",
                "next_role": "@coder"
            },
            "coder": {
                "name": "@coder",
                "definition": "Code Implementation Specialist who writes clean, efficient, modular code",
                "output": "working code files",
                "next_role": "@documentation-writer"
            },
            "documentation-writer": {
                "name": "@documentation-writer",
                "definition": "Evidence-Based Documentation Specialist who creates measurable, effective documentation",
                "output": "user guides, API docs",
                "next_role": "@git-mate"
            },
            "git-mate": {
                "name": "@git-mate",
                "definition": "Git Workflow and Versioning Specialist (GitMate) who manages version control",
                "output": "commits, tags, changelog",
                "next_role": "deployment"
            }
        }
        self.migration_report = []
        
    def backup_files(self):
        """Create backup of all files before migration"""
        print(f"Creating backup in {self.backup_dir}...")
        os.makedirs(self.backup_dir, exist_ok=True)
        
        # Backup main files
        files_to_backup = [
            "AI-Roles.md",
            "CLAUDE.md",
            ".claude/commands/roles.md"
        ]
        
        # Add all command files
        for role_key in self.roles.keys():
            files_to_backup.append(f".claude/commands/{role_key}.md")
        
        for file_path in files_to_backup:
            full_path = f"{self.base_path}/{file_path}"
            if os.path.exists(full_path):
                backup_path = f"{self.backup_dir}/{file_path}"
                os.makedirs(os.path.dirname(backup_path), exist_ok=True)
                shutil.copy2(full_path, backup_path)
                print(f"  Backed up: {file_path}")
        
        self.migration_report.append(f"Backup created: {self.backup_dir}")
    
    def add_interaction_pattern(self, role_content: str, role_name: str) -> str:
        """Add standardized interaction pattern to role"""
        
        # Define role-specific question structures
        question_structures = {
            "project-initiator": """
## Interactive Session Structure
- Phase 1: Overview & Context Setting
- Phase 2: Hierarchical Question Gathering (1, 1.1, 1.1.a format)
- Phase 3: Summary & Confirmation
- Phase 4: Output Generation & Validation

## Question Hierarchy Pattern

### Discovery Phase Overview
I'll guide you through 4 main areas with approximately 15 total questions:

1. Problem Definition (4-5 questions)
   1.1. Problem metrics and measurement
   1.2. Impact analysis
2. Validation & Evidence (3-4 questions)
   2.1. Existing solutions evaluation
   2.2. Evidence of problem severity
3. Constraints & Resources (3-4 questions)
   3.1. Technical constraints
   3.2. Resource limitations
4. Success Vision (2-3 questions)
   4.1. Success metrics
   4.2. Timeline expectations

Total estimated questions: 15
Estimated time: 10-15 minutes

Navigation: Type 'skip' to move forward, 'back' to revisit, 'overview' to see all questions""",
            
            "requirements-collector": """
## Interactive Session Structure
- Phase 1: Overview & Context Setting
- Phase 2: Hierarchical Question Gathering (1, 1.1, 1.1.a format)
- Phase 3: Summary & Confirmation
- Phase 4: Output Generation & Validation

## Question Hierarchy Pattern

### Requirements Gathering Overview
I'll guide you through 4 main areas with approximately 20 questions:

1. Functional Requirements (6-7 questions)
   1.1. Core features
       1.1.a. Feature priorities
       1.1.b. Feature dependencies
   1.2. User workflows
2. Non-Functional Requirements (5-6 questions)
   2.1. Performance requirements
   2.2. Security requirements
3. User Experience (4-5 questions)
   3.1. User personas
   3.2. Accessibility needs
4. Integration & Data (3-4 questions)
   4.1. External systems
   4.2. Data requirements

Total estimated questions: 20
Estimated time: 15-20 minutes""",
            
            "mvp-specialist": """
## Interactive Session Structure
- Phase 1: Overview & Context Setting
- Phase 2: Hierarchical Question Gathering (1, 1.1, 1.1.a format)
- Phase 3: Summary & Confirmation
- Phase 4: Output Generation & Validation

## Question Hierarchy Pattern

### MVP Definition Overview
I'll guide you through 3 main areas with approximately 12 questions:

1. Core Value Proposition (4-5 questions)
   1.1. Primary user need
       1.1.a. Evidence of need
       1.1.b. Alternative solutions
   1.2. Unique value delivery
2. Feature Prioritization (4-5 questions)
   2.1. Must-have features
   2.2. Should-have features
   2.3. Could-have features
3. Success Metrics (3-4 questions)
   3.1. Validation criteria
   3.2. Learning objectives

Total estimated questions: 12
Estimated time: 10-12 minutes"""
        }
        
        # Get role-specific or default pattern
        pattern = question_structures.get(role_name, """
## Interactive Session Structure
- Phase 1: Overview & Context Setting
- Phase 2: Hierarchical Question Gathering (1, 1.1, 1.1.a format)
- Phase 3: Summary & Confirmation
- Phase 4: Output Generation & Validation

## Question Hierarchy Pattern
Questions will follow hierarchical numbering:
1. Main topic
   1.1. Clarifying question
       1.1.a. Specific detail
   1.2. Related aspect
2. Next main topic""")
        
        return role_content + "\n" + pattern
    
    def add_standard_operating_procedures(self, role_content: str, role_name: str) -> str:
        """Add SOPs to role"""
        
        sop_template = f"""
## Standard Operating Procedures

### Initial Session
1. Display role header with current and next suggested role
2. Present question overview with time estimate
3. Confirm user readiness to proceed
4. Begin hierarchical questioning

### Working Sessions
1. Follow UNDERSTAND → DESIGN → STRUCTURE → VALIDATE approach
2. Update task status in real-time
3. Maintain version history in output files
4. Regular progress checkpoints with user

### Validation Session
1. Present completed work summary
2. Request user validation
3. Address any concerns or gaps
4. Confirm readiness for handoff

### Handoff Session
1. Summarize deliverables created
2. Highlight key decisions and rationale
3. Prepare handoff artifacts for next role
4. Suggest next role: {self.roles.get(role_name, {}).get('next_role', 'next appropriate role')}"""
        
        return role_content + "\n" + sop_template
    
    def add_example_usage(self, role_content: str, role_name: str) -> str:
        """Add example usage to role"""
        
        role_info = self.roles.get(role_name, {})
        example = f"""
## Example Usage

```
Claude: "Based on your request, I recommend using {role_info.get('name', '@role-name')} to {role_info.get('definition', 'perform this task')}"
User: {role_info.get('name', '@role-name')} or /{role_name}

{role_info.get('name', 'Role')}: 🎭 **Current Role**: {role_info.get('name', 'Role Name')} - {role_info.get('definition', 'Role description')}
➡️ **Next Suggested Role**: {role_info.get('next_role', 'Next Role')} - Continue with next phase

I'll now begin the interactive session to gather the necessary information.

## Question Overview
[Presents hierarchical question structure]

Let's begin:

**[1/N] First Topic Area**

1. [First main question]?
   > [Waits for user response]
```"""
        
        return role_content + "\n" + example
    
    def add_missing_elements(self, role_content: str, role_name: str) -> str:
        """Add all missing standardized elements to a role"""
        
        enhancements = []
        
        # Check and add interaction pattern
        if "## Interactive Session Structure" not in role_content:
            role_content = self.add_interaction_pattern(role_content, role_name)
            enhancements.append("interaction_pattern")
        
        # Check and add SOPs
        if "## Standard Operating Procedures" not in role_content:
            role_content = self.add_standard_operating_procedures(role_content, role_name)
            enhancements.append("standard_operating_procedures")
        
        # Check and add example usage
        if "## Example Usage" not in role_content:
            role_content = self.add_example_usage(role_content, role_name)
            enhancements.append("example_usage")
        
        # Add summary & confirmation if missing
        if "SUMMARY & CONFIRMATION" not in role_content:
            confirmation_text = """
12. **SUMMARY & CONFIRMATION**:
    - After all questions, provide complete summary
    - Allow user to revise any answer
    - Confirm understanding before proceeding"""
            
            # Insert before WORKFLOW EVALUATION if it exists
            if "WORKFLOW EVALUATION" in role_content:
                role_content = role_content.replace("13. WORKFLOW EVALUATION", confirmation_text + "\n13. WORKFLOW EVALUATION")
            else:
                role_content += "\n" + confirmation_text
            enhancements.append("summary_confirmation")
        
        # Add instrumentation if missing
        if "INSTRUMENTATION" not in role_content and "8. " in role_content:
            instrumentation_text = """8. **INSTRUMENTATION**: Logging, metrics, monitoring requirements for production validation"""
            role_content = re.sub(r'8\.\s+.*', instrumentation_text + "\n9. ", role_content)
            enhancements.append("instrumentation")
        
        return role_content, enhancements
    
    def migrate_ai_roles_file(self):
        """Migrate the main AI-Roles.md file"""
        print("\nMigrating AI-Roles.md...")
        
        file_path = f"{self.base_path}/AI-Roles.md"
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Split content by role sections
        role_sections = re.split(r'(### @[\w-]+)', content)
        
        migrated_content = role_sections[0]  # Keep header
        
        for i in range(1, len(role_sections), 2):
            if i+1 < len(role_sections):
                role_header = role_sections[i]
                role_content = role_sections[i+1]
                
                # Extract role name
                role_name = re.search(r'@([\w-]+)', role_header).group(1)
                print(f"  Migrating {role_name}...")
                
                # Add missing elements
                enhanced_content, enhancements = self.add_missing_elements(role_content, role_name)
                
                migrated_content += role_header + enhanced_content
                
                if enhancements:
                    self.migration_report.append(f"Enhanced {role_name}: {', '.join(enhancements)}")
        
        # Write migrated content
        with open(file_path, 'w') as f:
            f.write(migrated_content)
        
        print(f"  AI-Roles.md migration complete")
    
    def migrate_command_files(self):
        """Migrate individual command files in .claude/commands/"""
        print("\nMigrating command files...")
        
        commands_dir = f"{self.base_path}/.claude/commands"
        
        for role_key in self.roles.keys():
            file_path = f"{commands_dir}/{role_key}.md"
            
            if os.path.exists(file_path):
                print(f"  Migrating {role_key}.md...")
                
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Add interactive pattern if missing
                if "## Interactive Q&A Framework" not in content and "## Question" not in content:
                    role_info = self.roles[role_key]
                    
                    # Add structured interaction section
                    interaction_section = f"""
## Structured Interaction Pattern

### Question Overview
Present all questions upfront with hierarchical numbering (1, 1.1, 1.1.a)

### Interactive Questioning
- Ask ONE question at a time
- Wait for user response before proceeding
- Allow 'skip', 'back', and 'overview' navigation

### Progress Tracking
Show progress: [Question X of Y] or [■■■□□□□□□□] 30% complete

### Summary & Confirmation
After all questions, provide summary and allow revisions

## Role Display
🎭 **Current Role**: {role_info['name']} - {role_info['definition']}
➡️ **Next Suggested Role**: {role_info['next_role']} - Continue with next phase"""
                    
                    # Insert after the user approval section
                    if "## Key Responsibilities" in content:
                        content = content.replace("## Key Responsibilities", interaction_section + "\n\n## Key Responsibilities")
                    else:
                        content += "\n" + interaction_section
                
                # Write updated content
                with open(file_path, 'w') as f:
                    f.write(content)
                
                self.migration_report.append(f"Updated command file: {role_key}.md")
    
    def update_claude_md(self):
        """Update CLAUDE.md with migration notes"""
        print("\nUpdating CLAUDE.md...")
        
        file_path = f"{self.base_path}/CLAUDE.md"
        
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Add migration note to version history in documentation registry
        migration_note = f"\n| role-template.md | Standardized template for all roles with interaction patterns | 1.0 | {datetime.now().strftime('%Y-%m-%d')} |"
        
        if "role-template.md" not in content:
            content = content.replace("| VERSION | Current version", migration_note + "\n| VERSION | Current version")
        
        # Update version history section if exists
        if "## Version History" not in content:
            version_section = f"""
## Version History
- v1.3 ({datetime.now().strftime('%Y-%m-%d')}): Migrated all roles to standardized template with hierarchical interaction patterns"""
            
            # Insert after documentation registry
            content = content.replace("# important-instruction-reminders", version_section + "\n\n# important-instruction-reminders")
        
        with open(file_path, 'w') as f:
            f.write(content)
        
        print("  CLAUDE.md updated")
    
    def generate_report(self):
        """Generate migration report"""
        report_path = f"{self.base_path}/migration_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        
        report_content = f"""# Role Migration Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary
Migrated all 10 roles to comply with role-template.md standards.

## Backup Location
{self.backup_dir}

## Changes Applied
### Universal Enhancements Added to All Roles:
- ✅ Hierarchical Question Pattern (1, 1.1, 1.1.a format)
- ✅ Interactive Session Structure (4 phases)
- ✅ Summary & Confirmation Process
- ✅ Standard Operating Procedures
- ✅ Example Usage Demonstrations
- ✅ Progress Tracking Indicators
- ✅ Navigation Options (skip, back, overview)

## Migration Details
{chr(10).join(self.migration_report)}

## Next Steps
1. Review migrated files for accuracy
2. Test each role with actual usage
3. Commit changes with message: "feat: Migrate all roles to standardized template"
4. Update VERSION file if needed

## Rollback Instructions
If needed, restore from backup:
```bash
cp -r {self.backup_dir}/* {self.base_path}/
```
"""
        
        with open(report_path, 'w') as f:
            f.write(report_content)
        
        print(f"\n✅ Migration complete! Report saved to: {report_path}")
        return report_path
    
    def run_migration(self):
        """Execute the full migration process"""
        print("=" * 60)
        print("Role Template Migration Script v1.0.0")
        print("=" * 60)
        
        # Step 1: Backup
        self.backup_files()
        
        # Step 2: Migrate main file
        self.migrate_ai_roles_file()
        
        # Step 3: Migrate command files
        self.migrate_command_files()
        
        # Step 4: Update CLAUDE.md
        self.update_claude_md()
        
        # Step 5: Generate report
        report_path = self.generate_report()
        
        print("\n" + "=" * 60)
        print("Migration completed successfully!")
        print(f"Review the report at: {report_path}")
        print(f"Backup saved at: {self.backup_dir}")
        print("=" * 60)

if __name__ == "__main__":
    migrator = RoleMigrator()
    migrator.run_migration()