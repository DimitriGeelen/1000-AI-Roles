# MVP Requirements: Role Editor Enhancement

## Core Problem to Solve
Disconnected workflow between Claude editing and file viewing - need a unified, simple interface for viewing and editing markdown files.

## Target Conditions

### Basic Version (4 hours to build)
**Goal**: Prove the concept works with minimal code
**Success Metric**: Can view and edit one markdown file through a web interface

**Essential Features**:
1. Single HTML file with embedded CSS/JS (true zero dependencies)
2. Display list of .md files in current directory only
3. Click file to view its raw content in a textarea
4. Edit button to make textarea editable
5. Save button to write changes back to file

**What We're NOT Building**:
- No subdirectory scanning
- No markdown rendering
- No syntax highlighting
- No preview mode
- No multiple file editing

### MVP Version (Tomorrow's Goal)
**Goal**: Deliver real value with minimal complexity
**Success Metric**: User can efficiently view and edit any markdown file in the project

**Essential (Must-Have) Features**:
1. **File Discovery**
   - Scan project directory and subdirectories for .md files
   - Display as simple list with file paths

2. **File Viewing**
   - Show file content in a large textarea
   - Display filename at top of editing area
   - Basic monospace font for readability

3. **Editing Workflow**
   - Single file editing at a time
   - Edit/Read mode toggle per file
   - Save button that writes to disk
   - Visual indicator for unsaved changes

4. **Simplicity First**
   - All functionality in single index.html file
   - Inline CSS (no external stylesheets)
   - Vanilla JavaScript (no frameworks)
   - No build process required

**Important (Should-Have) Features**:
1. Collapsible file list (show/hide sections)
2. Show first 100 characters as preview
3. Confirm dialog before saving
4. Keyboard shortcut for save (Ctrl+S)

**Technical Constraints**:
- Maximum 500 lines of code total
- Must work offline after initial load
- No npm packages or CDN dependencies
- File I/O through Claude Code's existing capabilities

### Future Version (Post-MVP)
**Could-Have Features** (explicitly NOT for tomorrow):
1. Markdown preview rendering
2. Side-by-side edit/preview
3. Syntax highlighting
4. Search across files
5. Multiple tabs for editing
6. Undo/redo functionality
7. File creation/deletion
8. Git integration
9. Dark mode
10. Mobile responsive design

## Validation Criteria

### Basic Version Success:
- [ ] Can see list of .md files
- [ ] Can click a file and see its content
- [ ] Can edit the content
- [ ] Can save changes that persist

### MVP Success:
- [ ] Loads in under 1 second
- [ ] Zero external dependencies verified
- [ ] All .md files discoverable
- [ ] Edit → Save workflow works reliably
- [ ] No maintenance required after deployment

## Implementation Strategy

### Day 1 Schedule:
1. **Hour 1-2**: Build Basic Version
   - Create index.html with minimal UI
   - Implement file list display
   - Add single file view/edit

2. **Hour 3-4**: Extend to MVP
   - Add subdirectory scanning
   - Implement save functionality
   - Add visual feedback

3. **Hour 5-6**: Polish & Test
   - Ensure zero dependencies
   - Test on different browsers
   - Verify no maintenance points

## Hypothesis to Validate
"A simple web-based editor with just view/edit/save functionality will be more efficient than the current prompt-based workflow"

**Validation Method**: 
- If the user uses this tool instead of prompts for the next 5 markdown edits, the hypothesis is validated
- If the user reverts to the old method, we need to understand why

## Risk Mitigation
1. **Complexity Risk**: Start with Basic Version, only add features that work perfectly
2. **Maintenance Risk**: No external dependencies, no complex state management
3. **Browser Risk**: Use only well-supported web standards (ES6, basic DOM)

## Not Doing (Critical for Success)
- No feature that requires ongoing maintenance
- No external libraries or frameworks
- No complex state management
- No features beyond core edit/save workflow
- No performance optimizations beyond basic functionality

## Success Metrics
1. **Immediate**: Tool loads and works on first try
2. **Day 1**: Successfully edit 3+ files without issues
3. **Week 1**: Still using tool without modifications needed

## Next Steps
1. Use `/architect` to design the simplest possible technical architecture
2. Use `/coder` to implement Basic Version first (2 hours max)
3. Test Basic Version before adding any MVP features