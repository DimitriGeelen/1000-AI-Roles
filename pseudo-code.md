# Pseudo-Code Logic Specifications: Role Editor Enhancement

## Version History
- v1.0 - 2025-07-28 - Initial pseudo-code for role editor enhancement

## Overview
This document provides detailed pseudo-code logic for implementing the role editor enhancement system. Each module follows the PROBLEM/APPROACH/ALGORITHM/EDGE CASES/COMPLEXITY structure.

## Module 1: Role Parser Module

### PROBLEM
Parse the AI-Roles.md file to extract structured role definitions that can be edited programmatically.

### APPROACH
1. Read the markdown file line by line
2. Identify role boundaries using markdown headers and patterns
3. Extract role components (name, title, definition, custom instructions)
4. Build structured role objects for manipulation

### ALGORITHM
```
FUNCTION parseRoles(markdownContent):
    roles = []
    currentRole = null
    currentSection = null
    lines = splitIntoLines(markdownContent)
    
    FOR each line in lines:
        // Check for role header pattern: ### @role-name: Role Title
        IF line matches pattern "### @([a-z-]+): (.+)":
            // Save previous role if exists
            IF currentRole is not null:
                roles.append(currentRole)
            
            // Start new role
            currentRole = {
                "roleName": extractRoleName(line),
                "title": extractRoleTitle(line),
                "definition": "",
                "customInstructions": [],
                "whenClaudeSuggests": ""
            }
            currentSection = "definition"
            
        ELSE IF currentRole is not null:
            // Check for section markers
            IF line contains "**Custom Instructions**":
                currentSection = "customInstructions"
            ELSE IF line contains "**When Claude Suggests**":
                currentSection = "whenClaudeSuggests"
            
            // Add content to appropriate section
            ELSE IF currentSection == "definition":
                currentRole.definition += line + "\n"
            ELSE IF currentSection == "customInstructions":
                IF line matches pattern "^\d+\. ":
                    instruction = extractInstructionText(line)
                    currentRole.customInstructions.append(instruction)
            ELSE IF currentSection == "whenClaudeSuggests":
                currentRole.whenClaudeSuggests += line + "\n"
    
    // Don't forget the last role
    IF currentRole is not null:
        roles.append(currentRole)
    
    RETURN roles
```

### EDGE CASES
1. Empty file or no roles found
2. Malformed role headers
3. Missing sections in a role
4. Duplicate role names
5. Special characters in role content
6. Very long role definitions

### COMPLEXITY
- Time: O(n) where n is number of lines
- Space: O(m) where m is total content size

## Module 2: Role Editor UI Module

### PROBLEM
Create a simple web interface for viewing and editing role definitions without external dependencies.

### APPROACH
1. Build single HTML file with embedded CSS/JS
2. Display role list in sidebar
3. Show selected role in main editor area
4. Implement edit/save workflow with visual feedback

### ALGORITHM
```
FUNCTION initializeUI():
    // Create HTML structure
    document.body.innerHTML = `
        <div id="container">
            <div id="sidebar">
                <h2>Roles</h2>
                <div id="role-list"></div>
            </div>
            <div id="editor">
                <div id="editor-header">
                    <h2 id="role-title">Select a role</h2>
                    <button id="edit-btn">Edit</button>
                    <button id="save-btn" style="display:none">Save</button>
                    <button id="cancel-btn" style="display:none">Cancel</button>
                </div>
                <textarea id="role-content" readonly></textarea>
            </div>
        </div>
    `
    
    // Load and display roles
    loadRoles()
    attachEventHandlers()

FUNCTION loadRoles():
    content = readFile("AI-Roles.md")
    roles = parseRoles(content)
    displayRoleList(roles)
    
FUNCTION displayRoleList(roles):
    listElement = getElementById("role-list")
    listElement.innerHTML = ""
    
    FOR each role in roles:
        roleItem = createElement("div")
        roleItem.className = "role-item"
        roleItem.textContent = role.title
        roleItem.onclick = () => selectRole(role)
        listElement.appendChild(roleItem)

FUNCTION selectRole(role):
    // Update UI to show selected role
    getElementById("role-title").textContent = role.title
    getElementById("role-content").value = formatRoleForDisplay(role)
    
    // Store current role for editing
    window.currentRole = role
    
    // Reset to read mode
    setReadMode()

FUNCTION setEditMode():
    getElementById("role-content").readOnly = false
    getElementById("edit-btn").style.display = "none"
    getElementById("save-btn").style.display = "inline"
    getElementById("cancel-btn").style.display = "inline"
    
    // Store original content for cancel
    window.originalContent = getElementById("role-content").value

FUNCTION setReadMode():
    getElementById("role-content").readOnly = true
    getElementById("edit-btn").style.display = "inline"
    getElementById("save-btn").style.display = "none"
    getElementById("cancel-btn").style.display = "none"

FUNCTION saveRole():
    newContent = getElementById("role-content").value
    updatedRole = parseRoleFromText(newContent)
    
    // Validate before saving
    validationResult = validateRole(updatedRole)
    IF validationResult.hasErrors:
        showError(validationResult.errors)
        RETURN
    
    // Update role in memory
    updateRoleInList(updatedRole)
    
    // Save to file
    saveToFile()
    
    // Return to read mode
    setReadMode()
    showSuccess("Role saved successfully")
```

### EDGE CASES
1. Browser compatibility issues
2. Large role definitions causing UI lag
3. Concurrent editing attempts
4. Lost focus during editing
5. Accidental navigation away with unsaved changes

### COMPLEXITY
- Time: O(n) for initial load, O(1) for most operations
- Space: O(n) where n is total role content size

## Module 3: Role Validator Module

### PROBLEM
Ensure role definitions meet all requirements before saving to prevent corruption of AI-Roles.md.

### APPROACH
1. Define validation rules for each role field
2. Check format, required fields, and constraints
3. Return detailed error messages for user correction

### ALGORITHM
```
FUNCTION validateRole(role):
    errors = []
    
    // Validate role name format
    IF NOT role.roleName matches pattern "^@[a-z]+(-[a-z]+)*$":
        errors.append("Role name must be @lowercase-hyphenated format")
    
    // Check required fields
    IF role.title is empty:
        errors.append("Role title is required")
    
    IF role.definition is empty:
        errors.append("Role definition is required")
    
    // Validate custom instructions format
    FOR i, instruction in enumerate(role.customInstructions):
        IF instruction is empty:
            errors.append(f"Custom instruction {i+1} cannot be empty")
    
    // Check for duplicate role names
    IF isDuplicateRoleName(role.roleName):
        errors.append("Role name already exists")
    
    // Check field lengths
    IF length(role.definition) > 5000:
        errors.append("Role definition exceeds maximum length")
    
    RETURN {
        "hasErrors": length(errors) > 0,
        "errors": errors
    }

FUNCTION isDuplicateRoleName(roleName):
    existingRoles = getCurrentRoles()
    FOR role in existingRoles:
        IF role.roleName == roleName AND role != currentEditingRole:
            RETURN true
    RETURN false
```

### EDGE CASES
1. Unicode characters in role content
2. Very long role names
3. Special markdown syntax in definitions
4. Empty custom instructions list
5. Whitespace-only fields

### COMPLEXITY
- Time: O(n) where n is number of existing roles
- Space: O(1) for validation results

## Module 4: File Writer Module

### PROBLEM
Write validated role changes back to AI-Roles.md while preserving file structure and creating backups.

### APPROACH
1. Create backup of current file
2. Reconstruct markdown from role objects
3. Write new content atomically
4. Verify write success

### ALGORITHM
```
FUNCTION saveToFile():
    TRY:
        // Create backup first
        backupPath = createBackup()
        
        // Get all current roles
        roles = getAllRoles()
        
        // Convert to markdown format
        markdownContent = rolesToMarkdown(roles)
        
        // Write to file atomically
        writeFileAtomic("AI-Roles.md", markdownContent)
        
        // Verify write
        verifyContent = readFile("AI-Roles.md")
        IF verifyContent != markdownContent:
            THROW "File write verification failed"
        
        // Log success
        logOperation("save", "success", {
            "rolesCount": length(roles),
            "fileSize": length(markdownContent)
        })
        
        RETURN true
        
    CATCH error:
        // Restore from backup if needed
        IF backupPath exists:
            restoreFromBackup(backupPath)
        
        logOperation("save", "error", {
            "error": error.message
        })
        
        THROW error

FUNCTION createBackup():
    timestamp = getCurrentTimestamp()
    backupPath = f"AI-Roles.md.backup.{timestamp}"
    copyFile("AI-Roles.md", backupPath)
    RETURN backupPath

FUNCTION rolesToMarkdown(roles):
    markdown = "# AI Roles\n\n"
    markdown += "This file contains role definitions...\n\n"
    
    FOR role in roles:
        markdown += f"### {role.roleName}: {role.title}\n\n"
        markdown += role.definition + "\n\n"
        
        IF role.customInstructions.length > 0:
            markdown += "**Custom Instructions:**\n"
            FOR i, instruction in enumerate(role.customInstructions):
                markdown += f"{i+1}. {instruction}\n"
            markdown += "\n"
        
        IF role.whenClaudeSuggests:
            markdown += "**When Claude Suggests:**\n"
            markdown += role.whenClaudeSuggests + "\n"
        
        markdown += "\n---\n\n"
    
    RETURN markdown

FUNCTION writeFileAtomic(path, content):
    tempPath = path + ".tmp"
    writeFile(tempPath, content)
    renameFile(tempPath, path)
```

### EDGE CASES
1. File permissions issues
2. Disk space limitations
3. Concurrent file access
4. Network drive delays
5. File locked by another process
6. Backup creation failure

### COMPLEXITY
- Time: O(n) where n is total content size
- Space: O(n) for backup storage

## Module 5: Monitoring Integration

### PROBLEM
Instrument the role editor to capture usage metrics and technical performance data for validation.

### APPROACH
1. Add timing measurements to key operations
2. Track user actions and patterns
3. Log errors with context
4. Generate usage reports

### ALGORITHM
```
FUNCTION initializeMonitoring():
    window.metrics = {
        "sessionStart": Date.now(),
        "operations": [],
        "errors": [],
        "performance": {}
    }
    
    // Wrap key functions with timing
    wrapWithTiming("parseRoles")
    wrapWithTiming("saveToFile")
    wrapWithTiming("validateRole")

FUNCTION trackOperation(operation, details):
    window.metrics.operations.push({
        "timestamp": Date.now(),
        "operation": operation,
        "details": details
    })

FUNCTION trackError(error, context):
    window.metrics.errors.push({
        "timestamp": Date.now(),
        "error": error.message,
        "stack": error.stack,
        "context": context
    })

FUNCTION measurePerformance(operation):
    startTime = Date.now()
    
    RETURN FUNCTION onComplete():
        duration = Date.now() - startTime
        
        IF NOT window.metrics.performance[operation]:
            window.metrics.performance[operation] = []
        
        window.metrics.performance[operation].push(duration)
        
        // Log if operation is slow
        IF duration > 1000:
            console.warn(f"{operation} took {duration}ms")

FUNCTION generateUsageReport():
    report = {
        "sessionDuration": Date.now() - window.metrics.sessionStart,
        "totalOperations": window.metrics.operations.length,
        "operationBreakdown": countByType(window.metrics.operations),
        "errorCount": window.metrics.errors.length,
        "averagePerformance": calculateAverages(window.metrics.performance),
        "editCompletionRate": calculateCompletionRate(),
        "validationErrorRate": calculateValidationErrorRate()
    }
    
    RETURN report

FUNCTION calculateCompletionRate():
    edits = filterOperations("startEdit")
    saves = filterOperations("saveRole")
    cancels = filterOperations("cancelEdit")
    
    IF edits.length == 0:
        RETURN 1.0
    
    RETURN saves.length / edits.length

FUNCTION calculateValidationErrorRate():
    validations = filterOperations("validate")
    validationErrors = filterOperations("validationError")
    
    IF validations.length == 0:
        RETURN 0.0
    
    RETURN validationErrors.length / validations.length
```

### EDGE CASES
1. Browser storage limitations
2. Memory leaks from excessive logging
3. Performance impact of monitoring
4. Clock skew in timestamps
5. Missing operation tracking

### COMPLEXITY
- Time: O(1) for tracking, O(n) for report generation
- Space: O(n) where n is number of operations

## Integration Flow

### PROBLEM
Coordinate all modules to create a cohesive role editing experience.

### APPROACH
1. Initialize all modules on page load
2. Coordinate data flow between modules
3. Handle errors gracefully
4. Provide user feedback

### ALGORITHM
```
FUNCTION main():
    TRY:
        // Initialize monitoring first
        initializeMonitoring()
        
        // Setup UI
        initializeUI()
        
        // Load initial data
        loadAndDisplayRoles()
        
        // Setup auto-save reminder
        setInterval(checkForUnsavedChanges, 30000)
        
        // Log successful start
        trackOperation("appStart", {
            "version": "1.0",
            "browser": navigator.userAgent
        })
        
    CATCH error:
        showFatalError("Failed to initialize role editor", error)
        trackError(error, "initialization")

FUNCTION loadAndDisplayRoles():
    measure = measurePerformance("loadRoles")
    
    TRY:
        content = readFile("AI-Roles.md")
        roles = parseRoles(content)
        displayRoleList(roles)
        
        trackOperation("rolesLoaded", {
            "count": roles.length
        })
        
    FINALLY:
        measure.onComplete()

FUNCTION handleEditWorkflow():
    // Track edit start
    trackOperation("startEdit", {
        "role": window.currentRole.roleName
    })
    
    // Switch to edit mode
    setEditMode()
    
    // Setup change tracking
    getElementById("role-content").onchange = () => {
        window.hasUnsavedChanges = true
    }

FUNCTION handleSaveWorkflow():
    measure = measurePerformance("saveWorkflow")
    
    TRY:
        // Parse edited content
        newContent = getElementById("role-content").value
        updatedRole = parseRoleFromText(newContent)
        
        // Validate
        trackOperation("validate", {
            "role": updatedRole.roleName
        })
        
        validationResult = validateRole(updatedRole)
        
        IF validationResult.hasErrors:
            trackOperation("validationError", {
                "errors": validationResult.errors
            })
            showValidationErrors(validationResult.errors)
            RETURN
        
        // Save
        updateRoleInMemory(updatedRole)
        saveToFile()
        
        // Update UI
        refreshRoleList()
        setReadMode()
        
        // Track success
        trackOperation("saveRole", {
            "role": updatedRole.roleName,
            "changes": calculateChanges(window.originalContent, newContent)
        })
        
        showSuccess("Role saved successfully")
        
    CATCH error:
        trackError(error, "save")
        showError("Failed to save role: " + error.message)
        
    FINALLY:
        measure.onComplete()
        window.hasUnsavedChanges = false
```

### EDGE CASES
1. Module initialization failures
2. Circular dependencies
3. Race conditions in async operations
4. Memory management with large datasets
5. Browser refresh with unsaved changes

### COMPLEXITY
- Time: O(n) for initialization, O(1) for most operations
- Space: O(n) for role storage and monitoring data

## Performance Optimization Considerations

### PROBLEM
Ensure the editor remains responsive even with many roles or large definitions.

### APPROACH
1. Lazy loading of role content
2. Debouncing of validation
3. Virtual scrolling for long lists
4. Efficient DOM updates

### ALGORITHM
```
FUNCTION optimizePerformance():
    // Debounce validation during typing
    validateDebounced = debounce(validateRole, 500)
    
    // Virtual scrolling for role list
    IF roles.length > 50:
        implementVirtualScrolling()
    
    // Lazy load role content
    FUNCTION selectRoleLazy(role):
        showLoading()
        
        requestAnimationFrame(() => {
            displayRoleContent(role)
            hideLoading()
        })
    
    // Batch DOM updates
    FUNCTION batchDOMUpdates(updates):
        fragment = document.createDocumentFragment()
        
        FOR update in updates:
            element = createElement(update.type)
            element.textContent = update.content
            fragment.appendChild(element)
        
        targetElement.appendChild(fragment)
```

## Next Steps

1. Implement Module 1 (Role Parser) first as it's foundational
2. Build Module 2 (UI) with minimal styling to test functionality
3. Add Module 3 (Validator) before implementing save functionality
4. Implement Module 4 (File Writer) with robust error handling
5. Add Module 5 (Monitoring) throughout implementation
6. Test with real AI-Roles.md file
7. Iterate based on usage metrics

## Version History
- v1.0 - 2025-07-28 - Initial comprehensive pseudo-code for all modules