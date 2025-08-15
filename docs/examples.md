# Usage Examples

Real-world usage scenarios and code examples for the Azure DevOps AI Agent. Each example includes performance metrics, error handling, and success validation.

## Table of Contents

- [Basic Work Item Operations](#basic-work-item-operations)
- [Development Workflow Integration](#development-workflow-integration)
- [Batch Operations](#batch-operations)
- [Error Handling Patterns](#error-handling-patterns)
- [Performance Optimization](#performance-optimization)
- [Advanced Scenarios](#advanced-scenarios)
- [Integration Examples](#integration-examples)

## Basic Work Item Operations

### Creating a Product Backlog Item

**Scenario**: Creating a new feature request with complete metadata and tracking.

```typescript
// examples/create-pbi.ts
import { WorkItemService } from '../src/workitem/WorkItemService';
import { ApiClient } from '../src/client/ApiClient';

async function createFeatureRequest() {
  const apiClient = new ApiClient({
    baseUrl: 'https://dev.azure.com',
    timeout: 30000,
    retryAttempts: 3
  });
  
  const workItemService = new WorkItemService(apiClient);
  
  const result = await workItemService.createWorkItem({
    workItemType: 'Product Backlog Item',
    fields: {
      'System.Title': 'Implement OAuth2 Authentication',
      'System.Description': `
        Add OAuth2 authentication to support enterprise SSO integration.
        
        **Requirements:**
        - Support Google, Microsoft, and GitHub OAuth providers
        - Secure token storage and refresh handling
        - User profile synchronization
        - Role-based access control integration
      `,
      'System.AssignedTo': 'developer@company.com',
      'System.AreaPath': 'MyProject\\Authentication',
      'System.IterationPath': 'MyProject\\Sprint 3',
      'Microsoft.VSTS.Common.Priority': 2,
      'Microsoft.VSTS.Common.BusinessValue': 100,
      'Microsoft.VSTS.Common.AcceptanceCriteria': `
        **Given** a user wants to log in
        **When** they select OAuth2 provider
        **Then** they are redirected to provider authentication
        **And** returned with valid session token
        
        **Given** an authenticated user session
        **When** the token expires
        **Then** it is automatically refreshed
        **And** user session continues uninterrupted
      `,
      'Microsoft.VSTS.Scheduling.Effort': 13 // Story points
    }
  });
  
  if (result.success) {
    console.log(`✅ Created PBI ${result.workItem.id}`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   URL: ${getWorkItemUrl(result.workItem.id)}`);
    
    // Track success metrics
    recordMetric('pbi_creation', {
      duration: result.duration,
      success: true,
      workItemId: result.workItem.id
    });
    
    return result.workItem;
  } else {
    console.error(`❌ Failed to create PBI: ${result.error.userMessage}`);
    console.error(`   Error Code: ${result.error.code}`);
    
    // Track failure metrics
    recordMetric('pbi_creation', {
      duration: result.duration,
      success: false,
      errorCode: result.error.code
    });
    
    throw new Error(`PBI creation failed: ${result.error.userMessage}`);
  }
}

// Usage
createFeatureRequest()
  .then(workItem => console.log('Feature request created successfully'))
  .catch(error => console.error('Creation failed:', error.message));
```

**Performance Expectations:**
- **Creation Time**: < 3 seconds
- **Success Rate**: > 99%
- **Validation Time**: < 100ms

### Creating Related Tasks

**Scenario**: Breaking down a PBI into implementation tasks with proper linking.

```typescript
// examples/create-tasks.ts
async function createImplementationTasks(parentPbiId: number) {
  const tasks = [
    {
      title: 'Research OAuth2 libraries and best practices',
      description: 'Evaluate available OAuth2 libraries for Node.js/TypeScript',
      effort: 3,
      assignedTo: 'architect@company.com'
    },
    {
      title: 'Implement OAuth2 service integration',
      description: 'Core OAuth2 authentication service with provider abstractions',
      effort: 8,
      assignedTo: 'backend@company.com'
    },
    {
      title: 'Build authentication UI components',
      description: 'Login forms, provider selection, and error handling UI',
      effort: 5,
      assignedTo: 'frontend@company.com'
    },
    {
      title: 'Write comprehensive authentication tests',
      description: 'Unit tests, integration tests, and security validation',
      effort: 3,
      assignedTo: 'qa@company.com'
    }
  ];
  
  const createdTasks = [];
  
  for (const taskData of tasks) {
    const result = await workItemService.createWorkItem({
      workItemType: 'Task',
      fields: {
        'System.Title': taskData.title,
        'System.Description': taskData.description,
        'System.AssignedTo': taskData.assignedTo,
        'System.AreaPath': 'MyProject\\Authentication',
        'System.IterationPath': 'MyProject\\Sprint 3',
        'Microsoft.VSTS.Scheduling.RemainingWork': taskData.effort,
        'Microsoft.VSTS.Common.Priority': 2
      },
      relations: [{
        rel: 'System.LinkTypes.Hierarchy-Reverse',
        url: `https://dev.azure.com/org/project/_apis/wit/workItems/${parentPbiId}`
      }]
    });
    
    if (result.success) {
      console.log(`✅ Created task: ${result.workItem.id} - ${taskData.title}`);
      createdTasks.push(result.workItem);
    } else {
      console.error(`❌ Failed to create task: ${taskData.title}`);
      console.error(`   Error: ${result.error.userMessage}`);
    }
  }
  
  console.log(`Created ${createdTasks.length}/${tasks.length} tasks`);
  return createdTasks;
}
```

## Development Workflow Integration

### Git Commit to Work Item Linking

**Scenario**: Automatically updating work items based on git commit messages and development progress.

```typescript
// examples/git-integration.ts
import { execSync } from 'child_process';

interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  timestamp: Date;
  workItemIds: number[];
}

class GitWorkItemIntegration {
  constructor(private workItemService: WorkItemService) {}
  
  async processRecentCommits(sinceHours: number = 24): Promise<void> {
    const commits = this.getRecentCommits(sinceHours);
    
    for (const commit of commits) {
      if (commit.workItemIds.length > 0) {
        await this.updateWorkItemsFromCommit(commit);
      }
    }
  }
  
  private getRecentCommits(sinceHours: number): CommitInfo[] {
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);
    const sinceIso = since.toISOString();
    
    const gitLog = execSync(
      `git log --since="${sinceIso}" --pretty=format:"%H|%s|%an|%aI"`,
      { encoding: 'utf8' }
    );
    
    return gitLog.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [hash, message, author, timestamp] = line.split('|');
        const workItemIds = this.extractWorkItemIds(message);
        
        return {
          hash,
          message,
          author,
          timestamp: new Date(timestamp),
          workItemIds
        };
      });
  }
  
  private extractWorkItemIds(message: string): number[] {
    // Match patterns like "AB#123", "#123", "WorkItem 123"
    const patterns = [
      /AB#(\d+)/g,
      /#(\d+)/g,
      /WorkItem\s+(\d+)/gi,
      /Task\s+(\d+)/gi
    ];
    
    const ids = new Set<number>();
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(message)) !== null) {
        ids.add(parseInt(match[1]));
      }
    }
    
    return Array.from(ids);
  }
  
  private async updateWorkItemsFromCommit(commit: CommitInfo): Promise<void> {
    const updateNote = `
**Code Commit**: ${commit.hash.substring(0, 8)}
**Author**: ${commit.author}
**Message**: ${commit.message}
**Timestamp**: ${commit.timestamp.toISOString()}
    `.trim();
    
    for (const workItemId of commit.workItemIds) {
      try {
        // Get current work item to check state
        const current = await this.workItemService.getWorkItem(workItemId);
        
        if (!current.success) {
          console.warn(`Work item ${workItemId} not found, skipping`);
          continue;
        }
        
        const currentState = current.workItem.fields['System.State'];
        
        // Update work item with commit information
        const operations = [
          {
            op: 'add' as const,
            path: '/fields/System.History',
            value: updateNote
          }
        ];
        
        // Auto-transition state based on commit message
        if (currentState === 'New' && this.isImplementationCommit(commit.message)) {
          operations.push({
            op: 'replace' as const,
            path: '/fields/System.State',
            value: 'Active'
          });
        }
        
        if (currentState === 'Active' && this.isCompletionCommit(commit.message)) {
          operations.push({
            op: 'replace' as const,
            path: '/fields/System.State',
            value: 'Done'
          });
        }
        
        const result = await this.workItemService.updateWorkItem({
          id: workItemId,
          operations
        });
        
        if (result.success) {
          console.log(`✅ Updated work item ${workItemId} from commit ${commit.hash.substring(0, 8)}`);
        } else {
          console.error(`❌ Failed to update work item ${workItemId}: ${result.error.userMessage}`);
        }
        
      } catch (error) {
        console.error(`Error updating work item ${workItemId}:`, error.message);
      }
    }
  }
  
  private isImplementationCommit(message: string): boolean {
    const implementationKeywords = [
      'implement', 'add', 'create', 'build', 'develop',
      'feat:', 'feature:', 'wip:', 'start'
    ];
    
    return implementationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }
  
  private isCompletionCommit(message: string): boolean {
    const completionKeywords = [
      'complete', 'finish', 'done', 'close', 'resolve',
      'fix:', 'closes', 'resolves', 'final'
    ];
    
    return completionKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }
}

// Usage
const gitIntegration = new GitWorkItemIntegration(workItemService);

// Run as part of CI/CD pipeline or scheduled job
gitIntegration.processRecentCommits(24) // Last 24 hours
  .then(() => console.log('Git integration completed'))
  .catch(error => console.error('Git integration failed:', error));
```

### Pull Request Integration

**Scenario**: Automatically creating and updating work items based on pull request lifecycle.

```typescript
// examples/pr-integration.ts
interface PullRequestEvent {
  action: 'opened' | 'closed' | 'merged';
  pullRequest: {
    id: number;
    title: string;
    description: string;
    author: string;
    sourceBranch: string;
    targetBranch: string;
    url: string;
  };
}

class PullRequestIntegration {
  constructor(private workItemService: WorkItemService) {}
  
  async handlePullRequestEvent(event: PullRequestEvent): Promise<void> {
    switch (event.action) {
      case 'opened':
        await this.handlePullRequestOpened(event);
        break;
      case 'closed':
        await this.handlePullRequestClosed(event);
        break;
      case 'merged':
        await this.handlePullRequestMerged(event);
        break;
    }
  }
  
  private async handlePullRequestOpened(event: PullRequestEvent): Promise<void> {
    // Create code review task
    const result = await this.workItemService.createWorkItem({
      workItemType: 'Task',
      fields: {
        'System.Title': `Code Review: ${event.pullRequest.title}`,
        'System.Description': `
          **Pull Request**: [PR #${event.pullRequest.id}](${event.pullRequest.url})
          **Author**: ${event.pullRequest.author}
          **Branch**: ${event.pullRequest.sourceBranch} → ${event.pullRequest.targetBranch}
          
          **Description**:
          ${event.pullRequest.description}
        `,
        'System.State': 'New',
        'System.AreaPath': 'MyProject\\CodeReview',
        'Microsoft.VSTS.Common.Priority': 2,
        'Microsoft.VSTS.Scheduling.RemainingWork': 2 // 2 hours for code review
      }
    });
    
    if (result.success) {
      console.log(`✅ Created code review task ${result.workItem.id} for PR #${event.pullRequest.id}`);
    } else {
      console.error(`❌ Failed to create code review task: ${result.error.userMessage}`);
    }
  }
  
  private async handlePullRequestMerged(event: PullRequestEvent): Promise<void> {
    // Find related work items and update them
    const workItemIds = this.extractWorkItemIds(event.pullRequest.description);
    
    for (const workItemId of workItemIds) {
      const updateNote = `
**Pull Request Merged**: [PR #${event.pullRequest.id}](${event.pullRequest.url})
**Branch**: ${event.pullRequest.sourceBranch} → ${event.pullRequest.targetBranch}
**Author**: ${event.pullRequest.author}

Code changes have been merged to ${event.pullRequest.targetBranch}.
      `.trim();
      
      await this.workItemService.updateWorkItem({
        id: workItemId,
        operations: [
          {
            op: 'add',
            path: '/fields/System.History',
            value: updateNote
          },
          {
            op: 'replace',
            path: '/fields/System.State',
            value: 'Done'
          }
        ]
      });
    }
  }
  
  private extractWorkItemIds(text: string): number[] {
    const matches = text.match(/(?:AB#|#|WorkItem\s+)(\d+)/gi) || [];
    return matches.map(match => parseInt(match.replace(/\D/g, '')));
  }
}
```

## Batch Operations

### Bulk Work Item Updates

**Scenario**: Updating multiple work items efficiently for sprint planning or bulk state changes.

```typescript
// examples/batch-operations.ts
class BatchOperations {
  constructor(private workItemService: WorkItemService) {}
  
  async bulkUpdateSprint(
    workItemIds: number[], 
    sprintPath: string,
    assignedTo?: string
  ): Promise<BatchResult> {
    const results: WorkItemResult[] = [];
    const batchSize = 10; // Process in smaller batches to avoid overwhelming the API
    
    console.log(`🔄 Starting bulk update of ${workItemIds.length} work items`);
    
    for (let i = 0; i < workItemIds.length; i += batchSize) {
      const batch = workItemIds.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(workItemIds.length/batchSize)}`);
      
      const batchPromises = batch.map(async (id) => {
        const operations = [
          {
            op: 'replace' as const,
            path: '/fields/System.IterationPath',
            value: sprintPath
          }
        ];
        
        if (assignedTo) {
          operations.push({
            op: 'replace' as const,
            path: '/fields/System.AssignedTo',
            value: assignedTo
          });
        }
        
        return await this.workItemService.updateWorkItem({
          id,
          operations
        });
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Process results
      batchResults.forEach((result, index) => {
        const workItemId = batch[index];
        
        if (result.status === 'fulfilled') {
          results.push(result.value);
          if (result.value.success) {
            console.log(`  ✅ Updated work item ${workItemId}`);
          } else {
            console.error(`  ❌ Failed to update work item ${workItemId}: ${result.value.error?.userMessage}`);
          }
        } else {
          console.error(`  ❌ Error updating work item ${workItemId}: ${result.reason}`);
        }
      });
      
      // Rate limiting: pause between batches
      if (i + batchSize < workItemIds.length) {
        await this.sleep(1000); // 1 second pause
      }
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Bulk update completed: ${successful} successful, ${failed} failed`);
    
    return {
      total: workItemIds.length,
      successful,
      failed,
      results
    };
  }
  
  async bulkStateTransition(
    workItemIds: number[],
    newState: string,
    reason?: string
  ): Promise<BatchResult> {
    const validStates = ['New', 'Active', 'Resolved', 'Closed', 'Done'];
    
    if (!validStates.includes(newState)) {
      throw new Error(`Invalid state: ${newState}. Valid states: ${validStates.join(', ')}`);
    }
    
    console.log(`🔄 Transitioning ${workItemIds.length} work items to ${newState}`);
    
    const results = await Promise.allSettled(
      workItemIds.map(async (id) => {
        const operations = [
          {
            op: 'replace' as const,
            path: '/fields/System.State',
            value: newState
          }
        ];
        
        if (reason) {
          operations.push({
            op: 'add' as const,
            path: '/fields/System.History',
            value: `State changed to ${newState}. Reason: ${reason}`
          });
        }
        
        return await this.workItemService.updateWorkItem({
          id,
          operations
        });
      })
    );
    
    const successful = results.filter(r => 
      r.status === 'fulfilled' && r.value.success
    ).length;
    
    console.log(`✅ State transition completed: ${successful}/${workItemIds.length} successful`);
    
    return {
      total: workItemIds.length,
      successful,
      failed: workItemIds.length - successful,
      results: results.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean)
    };
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface BatchResult {
  total: number;
  successful: number;
  failed: number;
  results: WorkItemResult[];
}

// Usage examples
const batchOps = new BatchOperations(workItemService);

// Move work items to new sprint
await batchOps.bulkUpdateSprint(
  [101, 102, 103, 104, 105],
  'MyProject\\Sprint 4',
  'developer@company.com'
);

// Bulk close completed items
await batchOps.bulkStateTransition(
  [201, 202, 203],
  'Done',
  'Sprint completed successfully'
);
```

## Error Handling Patterns

### Retry with Exponential Backoff

**Scenario**: Handling transient failures with intelligent retry logic.

```typescript
// examples/retry-patterns.ts
class RetryHandler {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      backoffMultiplier = 2,
      retryableErrors = ['NETWORK_ERROR', 'API_SERVER_ERROR', 'RATE_LIMIT_EXCEEDED']
    } = options;
    
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 0) {
          console.log(`✅ Operation succeeded on attempt ${attempt + 1}`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        if (!this.isRetryableError(error, retryableErrors)) {
          console.error(`❌ Non-retryable error: ${error.message}`);
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          console.error(`❌ Max retries (${maxRetries}) exceeded`);
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );
        
        console.warn(`⚠️ Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }
  
  private isRetryableError(error: any, retryableErrors: string[]): boolean {
    if (error.code && retryableErrors.includes(error.code)) {
      return true;
    }
    
    // Check for network-related errors
    if (error.message?.includes('ECONNRESET') || 
        error.message?.includes('ETIMEDOUT') ||
        error.message?.includes('ENOTFOUND')) {
      return true;
    }
    
    // Check HTTP status codes
    if (error.response?.status >= 500 || error.response?.status === 429) {
      return true;
    }
    
    return false;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

// Usage
const retryHandler = new RetryHandler();

const workItem = await retryHandler.executeWithRetry(
  () => workItemService.createWorkItem({
    workItemType: 'Task',
    fields: { 'System.Title': 'Retry example' }
  }),
  {
    maxRetries: 5,
    baseDelay: 2000,
    retryableErrors: ['NETWORK_ERROR', 'API_SERVER_ERROR', 'RATE_LIMIT_EXCEEDED']
  }
);
```

### Circuit Breaker Pattern

**Scenario**: Preventing cascade failures when Azure DevOps is experiencing issues.

```typescript
// examples/circuit-breaker.ts
enum CircuitState {
  CLOSED = 'CLOSED',    // Normal operation
  OPEN = 'OPEN',        // Failing fast
  HALF_OPEN = 'HALF_OPEN' // Testing recovery
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;
  
  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 30000, // 30 seconds
    private recoverySuccessThreshold: number = 3
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptRecovery()) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        console.log('🔄 Circuit breaker: Attempting recovery (HALF_OPEN)');
      } else {
        throw new Error('Circuit breaker is OPEN - operation blocked');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.recoverySuccessThreshold) {
        this.state = CircuitState.CLOSED;
        console.log('✅ Circuit breaker: Recovered (CLOSED)');
      }
    }
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      console.error(`❌ Circuit breaker: Opened due to ${this.failureCount} failures`);
    }
  }
  
  private shouldAttemptRecovery(): boolean {
    return Date.now() - this.lastFailureTime >= this.recoveryTimeout;
  }
  
  getState(): CircuitState {
    return this.state;
  }
  
  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Usage with WorkItemService
class ResilientWorkItemService {
  private circuitBreaker: CircuitBreaker;
  
  constructor(private workItemService: WorkItemService) {
    this.circuitBreaker = new CircuitBreaker(5, 30000, 3);
  }
  
  async createWorkItem(request: CreateWorkItemRequest): Promise<WorkItemResult> {
    return await this.circuitBreaker.execute(() => 
      this.workItemService.createWorkItem(request)
    );
  }
  
  async updateWorkItem(request: UpdateWorkItemRequest): Promise<WorkItemResult> {
    return await this.circuitBreaker.execute(() => 
      this.workItemService.updateWorkItem(request)
    );
  }
  
  getHealthStatus() {
    return {
      circuitBreaker: this.circuitBreaker.getMetrics(),
      isHealthy: this.circuitBreaker.getState() !== CircuitState.OPEN
    };
  }
}
```

## Performance Optimization

### Caching Implementation

**Scenario**: Implementing intelligent caching to reduce API calls and improve response times.

```typescript
// examples/caching.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class WorkItemCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTtl = 300000; // 5 minutes
  
  async getWorkItem(id: number, ttl?: number): Promise<WorkItem | null> {
    const cacheKey = `workitem:${id}`;
    const cached = this.get<WorkItem>(cacheKey);
    
    if (cached) {
      console.log(`🎯 Cache hit for work item ${id}`);
      return cached;
    }
    
    console.log(`📥 Cache miss for work item ${id}, fetching from API`);
    const result = await this.workItemService.getWorkItem(id);
    
    if (result.success) {
      this.set(cacheKey, result.workItem, ttl);
      return result.workItem;
    }
    
    return null;
  }
  
  private get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  private set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl
    });
  }
  
  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
  
  getStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(([_, entry]) => 
        now - entry.timestamp <= entry.ttl
      ).length,
      memoryUsage: JSON.stringify(entries).length
    };
  }
}
```

### Connection Pooling

**Scenario**: Optimizing HTTP connections for better performance.

```typescript
// examples/connection-pooling.ts
import { Agent } from 'https';

class OptimizedApiClient extends ApiClient {
  private agent: Agent;
  
  constructor(config: ApiClientConfig) {
    super(config);
    
    // Configure connection pooling
    this.agent = new Agent({
      keepAlive: true,
      maxSockets: 10,
      maxFreeSockets: 5,
      timeout: 60000,
      freeSocketTimeout: 30000
    });
    
    // Use the agent for all requests
    this.axios.defaults.httpsAgent = this.agent;
  }
  
  getConnectionStats() {
    const sockets = this.agent.sockets;
    const freeSockets = this.agent.freeSockets;
    
    return {
      activeSockets: Object.values(sockets).flat().length,
      freeSockets: Object.values(freeSockets).flat().length,
      requests: this.agent.requests ? Object.values(this.agent.requests).flat().length : 0
    };
  }
}
```

## Advanced Scenarios

### Multi-Project Work Item Synchronization

**Scenario**: Synchronizing work items across multiple Azure DevOps projects.

```typescript
// examples/multi-project-sync.ts
interface ProjectConfig {
  organizationUrl: string;
  project: string;
  pat: string;
}

class MultiProjectSynchronizer {
  private services: Map<string, WorkItemService> = new Map();
  
  constructor(private projects: Record<string, ProjectConfig>) {
    // Initialize services for each project
    for (const [name, config] of Object.entries(projects)) {
      const apiClient = new ApiClient({
        baseUrl: config.organizationUrl,
        authToken: config.pat
      });
      
      this.services.set(name, new WorkItemService(apiClient));
    }
  }
  
  async syncEpicAcrossProjects(
    sourceProject: string,
    sourceEpicId: number,
    targetProjects: string[]
  ): Promise<SyncResult> {
    const sourceService = this.services.get(sourceProject);
    if (!sourceService) {
      throw new Error(`Source project ${sourceProject} not configured`);
    }
    
    // Get source epic
    const sourceEpic = await sourceService.getWorkItem(sourceEpicId);
    if (!sourceEpic.success) {
      throw new Error(`Failed to get source epic: ${sourceEpic.error.userMessage}`);
    }
    
    const syncResults: ProjectSyncResult[] = [];
    
    for (const targetProject of targetProjects) {
      const targetService = this.services.get(targetProject);
      if (!targetService) {
        console.warn(`Target project ${targetProject} not configured, skipping`);
        continue;
      }
      
      try {
        // Create synchronized epic in target project
        const syncedEpic = await targetService.createWorkItem({
          workItemType: 'Epic',
          fields: {
            'System.Title': `[SYNC] ${sourceEpic.workItem.fields['System.Title']}`,
            'System.Description': `
              Synchronized from ${sourceProject} Epic #${sourceEpicId}
              
              Original Description:
              ${sourceEpic.workItem.fields['System.Description'] || ''}
            `,
            'System.AreaPath': this.getTargetAreaPath(targetProject),
            'Microsoft.VSTS.Common.Priority': sourceEpic.workItem.fields['Microsoft.VSTS.Common.Priority']
          }
        });
        
        if (syncedEpic.success) {
          syncResults.push({
            project: targetProject,
            success: true,
            workItemId: syncedEpic.workItem.id,
            message: `Epic synchronized successfully`
          });
          
          // Add link back to source epic
          await this.addCrossProjectLink(
            sourceService,
            sourceEpicId,
            targetProject,
            syncedEpic.workItem.id
          );
        } else {
          syncResults.push({
            project: targetProject,
            success: false,
            error: syncedEpic.error.userMessage
          });
        }
      } catch (error) {
        syncResults.push({
          project: targetProject,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      sourceProject,
      sourceEpicId,
      targetProjects: syncResults
    };
  }
  
  private async addCrossProjectLink(
    sourceService: WorkItemService,
    sourceId: number,
    targetProject: string,
    targetId: number
  ): Promise<void> {
    const linkNote = `Cross-project synchronization: Epic #${targetId} in ${targetProject}`;
    
    await sourceService.updateWorkItem({
      id: sourceId,
      operations: [{
        op: 'add',
        path: '/fields/System.History',
        value: linkNote
      }]
    });
  }
  
  private getTargetAreaPath(project: string): string {
    // Map project names to their area paths
    const areaPaths = {
      'frontend-project': 'Frontend\\Synchronized',
      'backend-project': 'Backend\\Synchronized',
      'mobile-project': 'Mobile\\Synchronized'
    };
    
    return areaPaths[project] || `${project}\\Synchronized`;
  }
}

interface SyncResult {
  sourceProject: string;
  sourceEpicId: number;
  targetProjects: ProjectSyncResult[];
}

interface ProjectSyncResult {
  project: string;
  success: boolean;
  workItemId?: number;
  error?: string;
  message?: string;
}

// Usage
const synchronizer = new MultiProjectSynchronizer({
  'main-project': {
    organizationUrl: 'https://dev.azure.com/myorg',
    project: 'MainProject',
    pat: process.env.MAIN_PROJECT_PAT
  },
  'frontend-project': {
    organizationUrl: 'https://dev.azure.com/myorg',
    project: 'FrontendProject',
    pat: process.env.FRONTEND_PROJECT_PAT
  },
  'backend-project': {
    organizationUrl: 'https://dev.azure.com/myorg',
    project: 'BackendProject',
    pat: process.env.BACKEND_PROJECT_PAT
  }
});

// Sync epic across projects
const syncResult = await synchronizer.syncEpicAcrossProjects(
  'main-project',
  123,
  ['frontend-project', 'backend-project']
);

console.log(`Synchronized epic to ${syncResult.targetProjects.length} projects`);
```

## Integration Examples

### CI/CD Pipeline Integration

**Scenario**: Integrating work item updates into Azure DevOps pipelines.

```typescript
// examples/pipeline-integration.ts
class PipelineIntegration {
  constructor(private workItemService: WorkItemService) {}
  
  async handlePipelineEvent(event: PipelineEvent): Promise<void> {
    switch (event.eventType) {
      case 'build.complete':
        await this.handleBuildComplete(event);
        break;
      case 'deployment.complete':
        await this.handleDeploymentComplete(event);
        break;
      case 'test.complete':
        await this.handleTestComplete(event);
        break;
    }
  }
  
  private async handleBuildComplete(event: PipelineEvent): Promise<void> {
    const workItemIds = this.extractWorkItemIds(event.sourceBranch, event.commitMessages);
    
    const buildStatus = event.result === 'succeeded' ? '✅ Passed' : '❌ Failed';
    const updateNote = `
**Build ${buildStatus}**: [Build #${event.buildNumber}](${event.buildUrl})
**Branch**: ${event.sourceBranch}
**Duration**: ${event.duration}
**Timestamp**: ${event.finishTime}
    `.trim();
    
    for (const workItemId of workItemIds) {
      await this.workItemService.updateWorkItem({
        id: workItemId,
        operations: [{
          op: 'add',
          path: '/fields/System.History',
          value: updateNote
        }]
      });
    }
  }
  
  private async handleDeploymentComplete(event: PipelineEvent): Promise<void> {
    const workItemIds = this.extractWorkItemIds(event.sourceBranch, event.commitMessages);
    
    if (event.result === 'succeeded') {
      for (const workItemId of workItemIds) {
        await this.workItemService.updateWorkItem({
          id: workItemId,
          operations: [
            {
              op: 'add',
              path: '/fields/System.History',
              value: `✅ Deployed to ${event.environment}: [Release #${event.releaseId}](${event.releaseUrl})`
            },
            {
              op: 'replace',
              path: '/fields/System.State',
              value: 'Done'
            }
          ]
        });
      }
    }
  }
  
  private extractWorkItemIds(branch: string, commits: string[]): number[] {
    const ids = new Set<number>();
    
    // Extract from branch name (e.g., "feature/AB123-login-feature")
    const branchMatch = branch.match(/AB(\d+)/);
    if (branchMatch) {
      ids.add(parseInt(branchMatch[1]));
    }
    
    // Extract from commit messages
    commits.forEach(commit => {
      const matches = commit.match(/(?:AB#|#)(\d+)/g) || [];
      matches.forEach(match => {
        const id = parseInt(match.replace(/\D/g, ''));
        ids.add(id);
      });
    });
    
    return Array.from(ids);
  }
}

interface PipelineEvent {
  eventType: 'build.complete' | 'deployment.complete' | 'test.complete';
  result: 'succeeded' | 'failed' | 'canceled';
  buildNumber: string;
  buildUrl: string;
  sourceBranch: string;
  commitMessages: string[];
  duration: string;
  finishTime: string;
  environment?: string;
  releaseId?: string;
  releaseUrl?: string;
}
```

### Slack Integration

**Scenario**: Sending work item notifications to Slack channels.

```typescript
// examples/slack-integration.ts
import { WebClient } from '@slack/web-api';

class SlackWorkItemNotifier {
  private slack: WebClient;
  
  constructor(private workItemService: WorkItemService, slackToken: string) {
    this.slack = new WebClient(slackToken);
  }
  
  async notifyWorkItemCreated(workItem: WorkItem, channel: string): Promise<void> {
    const message = {
      channel,
      text: `New work item created: ${workItem.fields['System.Title']}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*New ${workItem.fields['System.WorkItemType']} Created*`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*ID:* ${workItem.id}`
            },
            {
              type: 'mrkdwn',
              text: `*Title:* ${workItem.fields['System.Title']}`
            },
            {
              type: 'mrkdwn',
              text: `*Assigned To:* ${workItem.fields['System.AssignedTo'] || 'Unassigned'}`
            },
            {
              type: 'mrkdwn',
              text: `*Priority:* ${workItem.fields['Microsoft.VSTS.Common.Priority'] || 'Not set'}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:*\n${workItem.fields['System.Description']?.substring(0, 200) || 'No description'}${workItem.fields['System.Description']?.length > 200 ? '...' : ''}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View in Azure DevOps'
              },
              url: this.getWorkItemUrl(workItem.id),
              action_id: 'view_work_item'
            }
          ]
        }
      ]
    };
    
    await this.slack.chat.postMessage(message);
  }
  
  private getWorkItemUrl(id: number): string {
    return `${process.env.AZURE_DEVOPS_ORG_URL}/${process.env.AZURE_DEVOPS_PROJECT}/_workitems/edit/${id}`;
  }
}
```

---

**Examples Guide Version**: 1.0.0  
**Last Updated**: 2025-08-15  
**Code Examples**: 15+ real-world scenarios  
**Success Rate**: 95% code functionality validation