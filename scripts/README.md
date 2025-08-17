# Scripts Directory

This directory contains Azure DevOps integration scripts and utilities.

## Files

- **`create-fnb-pbi-simple.js`** - Creates F&B pricing PBIs in Azure DevOps
- **`list-pbis.js`** - Lists all PBIs from Azure DevOps project
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
node scripts/create-fnb-pbi-simple.js
node scripts/list-pbis.js
```