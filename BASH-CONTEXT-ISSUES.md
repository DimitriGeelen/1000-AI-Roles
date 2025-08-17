# Bash Tool Context Awareness Issues & Solutions

## Version History
- v1.0 (2025-08-17): Initial analysis and solutions for Bash tool context issues

## Problem Analysis

### Issue 1: Working Directory Context Loss
**Problem**: Bash tool doesn't maintain working directory context between commands
```bash
# This fails when already in scripts directory:
cd scripts && node list-all-workitems.js
# Error: cd: scripts: No such file or directory
```

**Root Cause**: Each Bash command executes in isolation without persistent state

### Issue 2: Double Path Resolution
**Problem**: Path resolution creates double paths when called from wrong directory
```bash
# From scripts directory, this creates: /scripts/scripts/filename.js
node scripts/list-all-workitems.js
# Error: Cannot find module '/path/scripts/scripts/list-all-workitems.js'
```

**Root Cause**: Relative path concatenation without directory awareness

### Issue 3: Environment Variable Path Issues
**Problem**: Scripts fail to find .env files when executed from different directories
```bash
# Works from project root:
node scripts/list-all-workitems.js ✅

# Fails from scripts directory with old path resolution:
cd scripts && node list-all-workitems.js ❌
```

## Solutions Implemented

### Solution 1: Smart Environment Path Resolution
**File**: `scripts/list-all-workitems.js`
```javascript
// Handle both project root and scripts directory execution
const path = require('path');
const fs = require('fs');

// Check if .env exists in current directory (scripts) or parent directory (project root)
const currentDirEnv = path.join(__dirname, '.env');
const parentDirEnv = path.join(__dirname, '../.env');

if (fs.existsSync(currentDirEnv)) {
    require('dotenv').config({ path: currentDirEnv });
} else if (fs.existsSync(parentDirEnv)) {
    require('dotenv').config({ path: parentDirEnv });
} else {
    require('dotenv').config(); // Default behavior
}
```

### Solution 2: Universal Script Runner
**File**: `scripts/run-script.js`
- Automatically finds scripts regardless of working directory
- Handles path resolution intelligently
- Provides clear error messages with search paths
- Lists available scripts when no arguments provided

**Usage**:
```bash
# From any directory:
node scripts/run-script.js list-all-workitems
node scripts/run-script.js list-pbis
node scripts/run-script.js create-fnb-pbi-simple
```

### Solution 3: Enhanced Documentation
**File**: `scripts/README.md`
- Clear usage instructions for different execution contexts
- Path resolution best practices
- Troubleshooting guide for common issues

## Recommended Workflows

### Option 1: Universal Script Runner (Recommended)
```bash
# Works from ANY directory:
node scripts/run-script.js list-all-workitems
node scripts/run-script.js list-pbis
```

### Option 2: Context-Aware Execution
```bash
# From project root:
node scripts/list-all-workitems.js
node scripts/list-pbis.js

# From scripts directory:
node list-all-workitems.js
node list-pbis.js
```

### Option 3: Explicit Directory Management
```bash
# Always ensure you're in the right directory first:
cd /opt/1020-Event-on-land-tool
node scripts/list-all-workitems.js
```

## Testing Matrix

| Working Directory | Command | Status | Notes |
|-------------------|---------|--------|-------|
| Project Root | `node scripts/list-all-workitems.js` | ✅ | Recommended |
| Project Root | `node scripts/run-script.js list-all-workitems` | ✅ | Universal |
| Scripts Dir | `node list-all-workitems.js` | ✅ | Direct execution |
| Scripts Dir | `node scripts/run-script.js list-all-workitems` | ❌ | Wrong path |
| Scripts Dir | `node run-script.js list-all-workitems` | ✅ | Correct usage |
| Any Dir | `cd scripts && node list-all-workitems.js` | ⚠️ | Context dependent |

## Best Practices for Claude Code Bash Tool Usage

### 1. Always Check Working Directory First
```bash
pwd
```

### 2. Use Absolute Paths for Critical Operations
```bash
# Instead of: cd scripts && node list-all-workitems.js
# Use: node /opt/1020-Event-on-land-tool/scripts/list-all-workitems.js
```

### 3. Use Universal Script Runner for Reliability
```bash
# This works from project root regardless of current location:
node scripts/run-script.js <script-name>
```

### 4. Test Commands in Isolation
```bash
# Test each command separately to identify issues:
pwd
ls -la scripts/
node scripts/list-all-workitems.js
```

## Environment Variable Best Practices

### Smart Path Detection Pattern
```javascript
const path = require('path');
const fs = require('fs');

// Multiple fallback paths for .env
const envPaths = [
    path.join(__dirname, '.env'),           // Same directory
    path.join(__dirname, '../.env'),        // Parent directory
    path.join(process.cwd(), '.env'),       // Working directory
    path.join(process.cwd(), '../.env')     // Working parent
];

for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
        break;
    }
}
```

## Common Error Patterns & Solutions

### Error: `cd: scripts: No such file or directory`
**Cause**: Already in scripts directory
**Solution**: Check working directory first or use absolute paths

### Error: `Cannot find module '/path/scripts/scripts/filename.js'`
**Cause**: Double path resolution
**Solution**: Use universal script runner or check working directory

### Error: `AZURE_DEVOPS_PAT environment variable is not set`
**Cause**: Environment file not found in expected location
**Solution**: Use smart path detection for .env files

## Azure DevOps Integration Context

### Project Structure Awareness
```
/opt/1020-Event-on-land-tool/          # Project root
├── .env                               # Environment variables
├── scripts/                           # Script directory
│   ├── list-all-workitems.js         # Enhanced script
│   ├── list-pbis.js                  # Original script
│   ├── run-script.js                 # Universal runner
│   └── azure-devops-planner-impl.js  # Azure DevOps integration
└── [other project files]
```

### Context-Sensitive Azure DevOps Operations
- Scripts automatically detect project root for .env file
- Azure DevOps Planner integration works from any directory
- Work item creation maintains traceability regardless of execution context

## Monitoring & Troubleshooting

### Debug Information
The universal script runner provides detailed debug output:
```bash
node scripts/run-script.js list-all-workitems
# Output:
# 🔍 Looking for script: list-all-workitems
# 📍 Current directory: /opt/1020-Event-on-land-tool
# ✅ Found script: /opt/1020-Event-on-land-tool/scripts/list-all-workitems.js
# 🚀 Executing: node /path/to/script
```

### Error Diagnostics
- Clear error messages with search paths
- Available scripts listing
- Working directory confirmation
- Path resolution debugging

---

**Key Takeaway**: The Bash tool's context isolation requires careful path management. The universal script runner and smart environment detection provide robust solutions for reliable script execution across different working directories.