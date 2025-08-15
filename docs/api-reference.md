# API Reference

Complete API reference for the Azure DevOps AI Agent. All examples include performance metrics and error handling patterns.

## Table of Contents

- [WorkItemService](#workitemservice)
- [ApiClient](#apiclient)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Performance Metrics](#performance-metrics)
- [Type Definitions](#type-definitions)

## WorkItemService

The `WorkItemService` class provides comprehensive work item management capabilities with built-in performance tracking and error handling.

### Class Initialization

```typescript
import { WorkItemService } from './src/workitem/WorkItemService';
import { ApiClient } from './src/client/ApiClient';

const apiClient = new ApiClient(config);
const workItemService = new WorkItemService(apiClient);
```

### Methods

#### createWorkItem()

Creates a new work item in Azure DevOps.

**Signature:**
```typescript
async createWorkItem(request: CreateWorkItemRequest): Promise<WorkItemResult>
```

**Parameters:**
- `request.workItemType` (string): Type of work item ('Epic', 'Feature', 'User Story', 'Task', 'Bug', 'Issue', 'Test Case')
- `request.fields` (Record<string, any>): Work item field values
- `request.relations` (WorkItemRelation[], optional): Related work items

**Example:**
```typescript
const result = await workItemService.createWorkItem({
  workItemType: 'Product Backlog Item',
  fields: {
    'System.Title': 'Implement user authentication',
    'System.Description': 'Add OAuth2 authentication flow',
    'System.AssignedTo': 'user@domain.com',
    'System.AreaPath': 'MyProject\\Authentication',
    'System.IterationPath': 'MyProject\\Sprint 1',
    'Microsoft.VSTS.Common.Priority': 2,
    'Microsoft.VSTS.Common.Severity': '2 - High'
  },
  relations: [{
    rel: 'System.LinkTypes.Hierarchy-Forward',
    url: 'https://dev.azure.com/org/project/_apis/wit/workItems/123'
  }]
});

if (result.success) {
  console.log(`Created work item: ${result.workItem.id}`);
  console.log(`Operation took: ${result.duration}ms`);
} else {
  console.error(`Error: ${result.error.userMessage}`);
}
```

**Performance Metrics:**
- **Target Response Time**: < 3 seconds
- **Success Rate**: > 99%
- **Validation Time**: < 100ms

#### getWorkItem()

Retrieves a single work item by ID.

**Signature:**
```typescript
async getWorkItem(id: number): Promise<WorkItemResult>
```

**Example:**
```typescript
const result = await workItemService.getWorkItem(12345);

if (result.success) {
  const workItem = result.workItem;
  console.log(`Title: ${workItem.fields['System.Title']}`);
  console.log(`State: ${workItem.fields['System.State']}`);
  console.log(`Assigned To: ${workItem.fields['System.AssignedTo']}`);
} else {
  console.error(`Failed to get work item: ${result.error.userMessage}`);
}
```

**Performance Metrics:**
- **Target Response Time**: < 2 seconds
- **Cache Hit Rate**: > 80% (for recently accessed items)

#### getWorkItems()

Retrieves multiple work items by IDs.

**Signature:**
```typescript
async getWorkItems(ids: number[]): Promise<WorkItemsResult>
```

**Example:**
```typescript
const result = await workItemService.getWorkItems([101, 102, 103]);

if (result.success) {
  console.log(`Retrieved ${result.workItems.length} work items`);
  result.workItems.forEach(item => {
    console.log(`${item.id}: ${item.fields['System.Title']}`);
  });
}
```

**Performance Metrics:**
- **Batch Size Limit**: 200 work items per request
- **Target Response Time**: < 5 seconds for 50 items

#### updateWorkItem()

Updates an existing work item with patch operations.

**Signature:**
```typescript
async updateWorkItem(request: UpdateWorkItemRequest): Promise<WorkItemResult>
```

**Example:**
```typescript
const result = await workItemService.updateWorkItem({
  id: 12345,
  operations: [
    {
      op: 'replace',
      path: '/fields/System.State',
      value: 'Active'
    },
    {
      op: 'replace',
      path: '/fields/System.Description',
      value: 'Updated description with implementation details'
    },
    {
      op: 'add',
      path: '/fields/Microsoft.VSTS.Common.AcceptanceCriteria',
      value: 'Given user clicks login, When OAuth2 flow completes, Then user is authenticated'
    }
  ]
});

if (result.success) {
  console.log(`Updated work item ${result.workItem.id}`);
} else {
  console.error(`Update failed: ${result.error.userMessage}`);
}
```

**Supported Operations:**
- `add`: Add new field value
- `replace`: Update existing field value
- `remove`: Remove field value

**Performance Metrics:**
- **Target Response Time**: < 2 seconds
- **Optimistic Concurrency**: Handled automatically

#### deleteWorkItem()

Deletes a work item (moves to Removed state).

**Signature:**
```typescript
async deleteWorkItem(id: number): Promise<DeleteResult>
```

**Example:**
```typescript
const result = await workItemService.deleteWorkItem(12345);

if (result.success) {
  console.log(`Work item deleted in ${result.duration}ms`);
} else {
  console.error(`Delete failed: ${result.error.userMessage}`);
}
```

#### getPerformanceMetrics()

Retrieves performance metrics for monitoring and optimization.

**Signature:**
```typescript
getPerformanceMetrics(): PerformanceMetrics[]
```

**Example:**
```typescript
const metrics = workItemService.getPerformanceMetrics();

// Calculate average response times
const createMetrics = metrics.filter(m => m.operation === 'workitem.create');
const avgCreateTime = createMetrics.reduce((sum, m) => sum + m.duration, 0) / createMetrics.length;

console.log(`Average create time: ${avgCreateTime}ms`);
console.log(`Success rate: ${(createMetrics.filter(m => m.success).length / createMetrics.length * 100).toFixed(1)}%`);
```

## ApiClient

Low-level HTTP client with rate limiting, retries, and circuit breaker patterns.

### Configuration

```typescript
interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
}

const config: ApiClientConfig = {
  baseUrl: 'https://dev.azure.com',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  rateLimit: {
    requests: 100,
    windowMs: 60000 // 100 requests per minute
  }
};
```

### Methods

#### get()
```typescript
async get(url: string, params?: Record<string, any>): Promise<ApiResponse>
```

#### post()
```typescript
async post(url: string, data: any, params?: Record<string, any>): Promise<ApiResponse>
```

#### patch()
```typescript
async patch(url: string, data: any, params?: Record<string, any>): Promise<ApiResponse>
```

#### delete()
```typescript
async delete(url: string, params?: Record<string, any>): Promise<ApiResponse>
```

## Authentication

### AuthService

Handles Personal Access Token (PAT) authentication and organization management.

```typescript
import { AuthService } from './src/auth/AuthService';

const authService = new AuthService({
  organization: 'your-org',
  personalAccessToken: process.env.AZURE_DEVOPS_PAT,
  project: 'your-project'
});

// Validate authentication
const isValid = await authService.validateAuthentication();
if (!isValid) {
  throw new Error('Authentication failed');
}
```

### Environment Configuration

```bash
# Required environment variables
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-org
AZURE_DEVOPS_PROJECT=your-project-name
AZURE_DEVOPS_PAT=your-personal-access-token
```

## Error Handling

### Error Categories

All errors are categorized for better handling:

- **AUTH**: Authentication and authorization errors
- **NETWORK**: Network connectivity issues
- **VALIDATION**: Request validation failures
- **API**: Azure DevOps API errors
- **RATE_LIMIT**: Rate limiting violations
- **UNKNOWN**: Unexpected errors

### Error Structure

```typescript
interface AgentError {
  code: string;                    // Machine-readable error code
  message: string;                 // Technical error message
  category: ErrorCategory;         // Error classification
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  context: ErrorContext;          // Operation context
  userMessage: string;            // User-friendly message
  recoverable: boolean;           // Whether retry is possible
}
```

### Common Error Codes

#### Authentication Errors
- `AUTH_INVALID_PAT`: Invalid Personal Access Token
- `AUTH_EXPIRED_PAT`: Expired Personal Access Token
- `AUTH_INSUFFICIENT_PERMISSIONS`: Insufficient permissions

#### Validation Errors
- `VALIDATION_ERROR`: General validation failure
- `INVALID_WORK_ITEM_TYPE`: Invalid work item type
- `MISSING_REQUIRED_FIELD`: Required field missing
- `INVALID_FIELD_VALUE`: Field value validation failure

#### API Errors
- `WORK_ITEM_NOT_FOUND`: Work item doesn't exist
- `WORK_ITEM_CONFLICT`: Concurrent modification conflict
- `API_SERVER_ERROR`: Azure DevOps server error

#### Network Errors
- `NETWORK_ERROR`: Connection failure
- `TIMEOUT_ERROR`: Request timeout
- `RATE_LIMIT_EXCEEDED`: Too many requests

### Error Handling Example

```typescript
try {
  const result = await workItemService.createWorkItem(request);
  
  if (!result.success) {
    const error = result.error;
    
    switch (error.category) {
      case 'AUTH':
        console.error('Authentication issue:', error.userMessage);
        // Redirect to authentication setup
        break;
        
      case 'VALIDATION':
        console.error('Data validation failed:', error.userMessage);
        // Show field-specific errors to user
        break;
        
      case 'RATE_LIMIT':
        console.warn('Rate limit exceeded, retrying after delay');
        // Implement exponential backoff
        break;
        
      case 'NETWORK':
        if (error.recoverable) {
          console.warn('Network issue, queuing for retry');
          // Queue operation for later retry
        }
        break;
        
      default:
        console.error('Unexpected error:', error.message);
    }
  }
} catch (error) {
  console.error('Unhandled error:', error);
}
```

## Performance Metrics

### Metric Collection

All operations automatically collect performance data:

```typescript
interface PerformanceMetrics {
  operation: string;      // Operation name (e.g., 'workitem.create')
  duration: number;       // Duration in milliseconds
  success: boolean;       // Whether operation succeeded
  timestamp: Date;        // When operation completed
  metadata?: Record<string, any>; // Additional context
}
```

### Performance Monitoring

```typescript
// Get all metrics
const allMetrics = workItemService.getPerformanceMetrics();

// Filter by operation type
const createOps = allMetrics.filter(m => m.operation === 'workitem.create');

// Calculate performance statistics
const stats = {
  totalOperations: allMetrics.length,
  successRate: allMetrics.filter(m => m.success).length / allMetrics.length,
  averageDuration: allMetrics.reduce((sum, m) => sum + m.duration, 0) / allMetrics.length,
  p95Duration: calculatePercentile(allMetrics.map(m => m.duration), 95),
  errorsByCategory: groupBy(allMetrics.filter(m => !m.success), 'category')
};

console.log('Performance Statistics:', stats);
```

### Performance Targets

| Operation | Target Time | Success Rate |
|-----------|-------------|--------------|
| Create Work Item | < 3s | > 99% |
| Get Work Item | < 2s | > 99.5% |
| Update Work Item | < 2s | > 99% |
| Delete Work Item | < 1s | > 99% |
| Bulk Operations (50 items) | < 5s | > 98% |

## Type Definitions

### Core Types

```typescript
// Work item structure
interface WorkItem {
  id?: number;
  fields: Record<string, any>;
  relations?: WorkItemRelation[];
}

// Common field names
const CommonFields = {
  TITLE: 'System.Title',
  DESCRIPTION: 'System.Description',
  STATE: 'System.State',
  ASSIGNED_TO: 'System.AssignedTo',
  AREA_PATH: 'System.AreaPath',
  ITERATION_PATH: 'System.IterationPath',
  PRIORITY: 'Microsoft.VSTS.Common.Priority',
  SEVERITY: 'Microsoft.VSTS.Common.Severity',
  ACCEPTANCE_CRITERIA: 'Microsoft.VSTS.Common.AcceptanceCriteria'
};

// Valid work item types
const WorkItemTypes = [
  'Epic',
  'Feature',
  'User Story',
  'Task',
  'Bug',
  'Issue',
  'Test Case'
];

// Valid states (may vary by work item type)
const CommonStates = [
  'New',
  'Active',
  'Resolved',
  'Closed',
  'Removed',
  'In Progress',
  'Done'
];
```

### Result Types

```typescript
interface WorkItemResult {
  success: boolean;
  workItem?: WorkItem;
  error?: AgentError;
  duration?: number;
}

interface WorkItemsResult {
  success: boolean;
  workItems?: WorkItem[];
  error?: AgentError;
  duration?: number;
}

interface DeleteResult {
  success: boolean;
  error?: AgentError;
  duration?: number;
}
```

## Analytics and Monitoring

### Usage Analytics

The API includes built-in analytics tracking:

```typescript
// Track operation success rates
const analytics = {
  operationCounts: groupBy(metrics, 'operation'),
  successRates: calculateSuccessRates(metrics),
  errorPatterns: analyzeErrorPatterns(failedOps),
  performanceTrends: calculateTrends(metrics)
};
```

### Health Checks

```typescript
// Built-in health check endpoint
async function healthCheck(): Promise<HealthStatus> {
  return {
    status: 'healthy',
    timestamp: new Date(),
    metrics: {
      responseTime: await measureResponseTime(),
      successRate: calculateRecentSuccessRate(),
      errorRate: calculateRecentErrorRate()
    },
    dependencies: {
      azureDevOps: await checkAzureDevOpsConnectivity(),
      authentication: await validateCurrentAuth()
    }
  };
}
```

---

**API Version**: 1.0.0  
**Azure DevOps API Version**: 7.0  
**Last Updated**: 2025-08-15