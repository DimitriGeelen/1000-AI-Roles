# Scripts Directory

This directory contains Azure DevOps integration scripts and utilities.

## Files

- **`create-fnb-pbi-simple.js`** - Creates F&B pricing PBIs in Azure DevOps
- **`list-pbis.js`** - Lists Product Backlog Items and User Stories from Azure DevOps project
- **`list-all-workitems.js`** - Lists ALL work items (Epics, Features, PBIs, Tasks, Bugs) with hierarchy
- **`azure-devops-planner-impl.js`** - Implementation for Azure DevOps Planner agent

## Usage

All scripts require the following environment variables:
- `AZURE_DEVOPS_ORG` - Organization name
- `AZURE_DEVOPS_PAT` - Personal Access Token
- `AZURE_DEVOPS_PROJECT` - Project name

Set up environment:
```bash
cp .env.example .env
# Edit .env with your Azure DevOps credentials
```

Run scripts:
```bash
# From project root directory:
node scripts/create-fnb-pbi-simple.js
node scripts/list-pbis.js              # Shows only PBIs and User Stories
node scripts/list-all-workitems.js     # Shows ALL work items with hierarchy

# From scripts directory:
node create-fnb-pbi-simple.js
node list-pbis.js
node list-all-workitems.js

# Path Resolution Fix:
# Always use relative paths from your current working directory
# Working directory should be either project root or scripts folder
```

## Path Resolution Issues Fixed:
- **Issue**: Running `node scripts/script.js` from scripts directory caused double path
- **Solution**: Use `list-all-workitems.js` for comprehensive work item listing
- **Best Practice**: Run from project root with `node scripts/filename.js`