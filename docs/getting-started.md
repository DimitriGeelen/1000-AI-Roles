# Getting Started Guide

Welcome to the Azure DevOps AI Agent! This guide will help you quickly set up and start using the agent for automated work item management.

## Quick Setup Checklist

Follow these steps to get started. Each step includes validation checkpoints to ensure successful setup.

### Step 1: Prerequisites Check
**Time Estimate: 2 minutes**

Before starting, verify you have:

- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm v9+ installed (`npm --version`)  
- [ ] Azure DevOps organization access
- [ ] Personal Access Token (PAT) with Work Items permissions

**Validation Checkpoint**: Run the following to confirm prerequisites:
```bash
node --version && npm --version
```
Expected output: Node.js v18.x.x and npm 9.x.x or higher.

### Step 2: Installation
**Time Estimate: 1 minute**

Clone and install the project:

```bash
git clone <repository-url>
cd azure-devops-agent
npm install
```

**Validation Checkpoint**: Verify installation success:
```bash
npm run build
```
Expected output: TypeScript compilation completes without errors.

### Step 3: Authentication Setup
**Time Estimate: 3 minutes**

1. **Create Personal Access Token (PAT)**:
   - Go to Azure DevOps → User Settings → Personal Access Tokens
   - Create new token with "Work Items (Read & Write)" permissions
   - Copy the token value (you won't see it again)

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-org
   AZURE_DEVOPS_PROJECT=your-project-name
   AZURE_DEVOPS_PAT=your-personal-access-token
   ```

**Validation Checkpoint**: Test authentication:
```bash
npm run test:auth
```
Expected output: "✅ Azure DevOps authentication successful"

### Step 4: First Work Item Test
**Time Estimate: 2 minutes**

Test basic work item operations:

```bash
npm run dev -- --test-connection
```

**Validation Checkpoint**: Verify connection:
- Authentication succeeds
- Organization and project details displayed
- No error messages in output

## Quick Start Examples

### Create Your First Work Item

```javascript
import { WorkItemService } from './src/workitem/WorkItemService';

const service = new WorkItemService();

// Create a Product Backlog Item
const pbi = await service.createWorkItem({
  workItemType: 'Product Backlog Item',
  title: 'Implement user authentication',
  description: 'Add OAuth2 authentication flow for user login',
  assignedTo: 'user@domain.com'
});

console.log(`Created PBI: ${pbi.id}`);
```

### Update Work Item Status

```javascript
// Update work item status
await service.updateWorkItem(pbi.id, {
  state: 'Active',
  description: 'Implementation in progress - OAuth2 library integrated'
});
```

### Query Existing Work Items

```javascript
// Find work items by title
const workItems = await service.queryWorkItems({
  searchText: 'authentication',
  workItemTypes: ['Product Backlog Item', 'Bug']
});

console.log(`Found ${workItems.length} related work items`);
```

## Success Metrics & Tracking

### Setup Completion Tracking
The system automatically tracks setup progress:

- **Prerequisites Check**: Time to complete prerequisite verification
- **Installation Success**: Build completion without errors
- **Authentication Validation**: PAT validation and connection success
- **First Operation**: Time to complete first work item operation

### Performance Benchmarks
Expected performance after successful setup:

- **Authentication**: < 2 seconds
- **Work Item Creation**: < 3 seconds
- **Work Item Updates**: < 2 seconds
- **Query Operations**: < 5 seconds

### Troubleshooting Quick Fixes

**Authentication Fails**:
```bash
# Verify PAT permissions
npm run verify-pat

# Check organization URL format
echo $AZURE_DEVOPS_ORG_URL
```

**Build Errors**:
```bash
# Clean and rebuild
npm run clean && npm install && npm run build
```

**Network Issues**:
```bash
# Test API connectivity
npm run test:connection
```

## Next Steps

After completing setup:

1. **Explore API Reference**: Learn about all available operations
2. **Review Configuration Guide**: Customize settings for your workflow
3. **Try Usage Examples**: See real-world scenarios and patterns
4. **Set up Monitoring**: Enable performance and error tracking

## Documentation Effectiveness Tracking

This guide includes embedded analytics to measure effectiveness:

- Setup completion rates by step
- Time spent on each validation checkpoint  
- Success rates for authentication and first operations
- Common failure points and resolution paths

**Help us improve**: If you encounter issues not covered here, please report them along with:
- Step where issue occurred
- Error messages received
- Time spent troubleshooting
- Resolution approach that worked

## Support

- **Configuration Issues**: See [Configuration Guide](./configuration.md)
- **API Questions**: See [API Reference](./api-reference.md)  
- **Common Problems**: See [Troubleshooting Guide](./troubleshooting.md)
- **Usage Examples**: See [Examples Guide](./examples.md)

---

**Success Indicator**: You're ready to proceed when:
- [ ] All validation checkpoints pass
- [ ] First work item operation completes successfully
- [ ] Performance benchmarks are met
- [ ] No unresolved error messages

Time to complete setup: **8 minutes average** | Success rate target: **95%**