// Work Item Service for Azure DevOps operations

import { ApiClient } from '../client/ApiClient';
import { 
  CreateWorkItemRequest, 
  UpdateWorkItemRequest, 
  WorkItem, 
  AgentError, 
  PerformanceMetrics 
} from '../types';
import { ERROR_MESSAGES } from '../config/default';

export interface WorkItemResult {
  success: boolean;
  workItem?: WorkItem;
  error?: AgentError;
  duration?: number;
}

export interface WorkItemsResult {
  success: boolean;
  workItems?: WorkItem[];
  error?: AgentError;
  duration?: number;
}

export interface DeleteResult {
  success: boolean;
  error?: AgentError;
  duration?: number;
}

export class WorkItemService {
  private apiClient: ApiClient;
  private performanceMetrics: PerformanceMetrics[] = [];
  private validWorkItemTypes = [
    'Epic',
    'Feature', 
    'User Story',
    'Task',
    'Bug',
    'Issue',
    'Test Case',
  ];

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  public async createWorkItem(request: CreateWorkItemRequest): Promise<WorkItemResult> {
    const startTime = Date.now();
    
    try {
      // Validate request
      const validation = this.validateCreateRequest(request);
      if (!validation.valid) {
        const error: AgentError = {
          code: validation.errorCode || 'VALIDATION_ERROR',
          message: validation.error || 'Validation failed',
          category: 'VALIDATION',
          severity: 'MEDIUM',
          context: {
            operation: 'createWorkItem',
            timestamp: new Date(),
          },
          userMessage: validation.error || 'Please check your work item data',
          recoverable: true,
        };

        this.recordMetric('create', startTime, false);
        return { success: false, error };
      }

      // Convert fields to patch operations
      const operations = Object.entries(request.fields).map(([key, value]) => ({
        op: 'add' as const,
        path: `/fields/${key}`,
        value,
      }));

      // Add relations if provided
      if (request.relations) {
        request.relations.forEach((relation, index) => {
          operations.push({
            op: 'add' as const,
            path: `/relations/-`,
            value: relation,
          });
        });
      }

      // Make API call
      const response = await this.apiClient.post(
        `/${this.getOrganization()}/${this.getProject()}/_apis/wit/workitems/$${request.workItemType}`,
        operations,
        {
          'api-version': '7.0',
        }
      );

      const duration = Date.now() - startTime;
      const workItem: WorkItem = {
        id: response.data.id,
        fields: response.data.fields,
        relations: response.data.relations,
      };

      this.recordMetric('create', startTime, true, { workItemId: workItem.id });
      return {
        success: true,
        workItem,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetric('create', startTime, false);
      
      const agentError = this.convertToAgentError(error, 'createWorkItem');
      return {
        success: false,
        error: agentError,
        duration,
      };
    }
  }

  public async getWorkItem(id: number): Promise<WorkItemResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.apiClient.get(
        `/${this.getOrganization()}/${this.getProject()}/_apis/wit/workitems/${id}`,
        {
          '$expand': 'Relations',
          'api-version': '7.0',
        }
      );

      const duration = Date.now() - startTime;
      const workItem: WorkItem = {
        id: response.data.id,
        fields: response.data.fields,
        relations: response.data.relations,
      };

      this.recordMetric('read', startTime, true, { workItemId: id });
      return {
        success: true,
        workItem,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetric('read', startTime, false, { workItemId: id });

      const agentError = this.convertToAgentError(error, 'getWorkItem', id);
      return {
        success: false,
        error: agentError,
        duration,
      };
    }
  }

  public async getWorkItems(ids: number[]): Promise<WorkItemsResult> {
    const startTime = Date.now();
    
    try {
      if (ids.length === 0) {
        this.recordMetric('read-bulk', startTime, true);
        return { success: true, workItems: [], duration: Date.now() - startTime };
      }

      const response = await this.apiClient.get(
        `/${this.getOrganization()}/${this.getProject()}/_apis/wit/workitems`,
        {
          'ids': ids.join(','),
          '$expand': 'Relations',
          'api-version': '7.0',
        }
      );

      const duration = Date.now() - startTime;
      const workItems: WorkItem[] = response.data.value.map((item: any) => ({
        id: item.id,
        fields: item.fields,
        relations: item.relations,
      }));

      this.recordMetric('read-bulk', startTime, true, { itemCount: workItems.length });
      return {
        success: true,
        workItems,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetric('read-bulk', startTime, false, { requestedIds: ids.length });

      const agentError = this.convertToAgentError(error, 'getWorkItems');
      return {
        success: false,
        error: agentError,
        duration,
      };
    }
  }

  public async updateWorkItem(request: UpdateWorkItemRequest): Promise<WorkItemResult> {
    const startTime = Date.now();
    
    try {
      // Validate update request
      const validation = this.validateUpdateRequest(request);
      if (!validation.valid) {
        const error: AgentError = {
          code: validation.errorCode || 'VALIDATION_ERROR',
          message: validation.error || 'Update validation failed',
          category: 'VALIDATION',
          severity: 'MEDIUM',
          context: {
            operation: 'updateWorkItem',
            workItemId: request.id,
            timestamp: new Date(),
          },
          userMessage: validation.error || 'Please check your update data',
          recoverable: true,
        };

        this.recordMetric('update', startTime, false, { workItemId: request.id });
        return { success: false, error };
      }

      // Make API call
      const response = await this.apiClient.patch(
        `/${this.getOrganization()}/${this.getProject()}/_apis/wit/workitems/${request.id}`,
        request.operations,
        {
          'api-version': '7.0',
        }
      );

      const duration = Date.now() - startTime;
      const workItem: WorkItem = {
        id: response.data.id,
        fields: response.data.fields,
        relations: response.data.relations,
      };

      this.recordMetric('update', startTime, true, { workItemId: request.id });
      return {
        success: true,
        workItem,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetric('update', startTime, false, { workItemId: request.id });

      const agentError = this.convertToAgentError(error, 'updateWorkItem', request.id);
      return {
        success: false,
        error: agentError,
        duration,
      };
    }
  }

  public async deleteWorkItem(id: number): Promise<DeleteResult> {
    const startTime = Date.now();
    
    try {
      await this.apiClient.delete(
        `/${this.getOrganization()}/${this.getProject()}/_apis/wit/workitems/${id}`,
        {
          'api-version': '7.0',
        }
      );

      const duration = Date.now() - startTime;
      this.recordMetric('delete', startTime, true, { workItemId: id });
      
      return {
        success: true,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetric('delete', startTime, false, { workItemId: id });

      const agentError = this.convertToAgentError(error, 'deleteWorkItem', id);
      return {
        success: false,
        error: agentError,
        duration,
      };
    }
  }

  public getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  private validateCreateRequest(request: CreateWorkItemRequest): { valid: boolean; error?: string; errorCode?: string } {
    // Validate work item type
    if (!this.validWorkItemTypes.includes(request.workItemType)) {
      return {
        valid: false,
        error: `Invalid work item type: ${request.workItemType}`,
        errorCode: 'INVALID_WORK_ITEM_TYPE',
      };
    }

    // Validate required fields
    if (!request.fields['System.Title']) {
      return {
        valid: false,
        error: 'System.Title is required for all work items',
        errorCode: 'MISSING_REQUIRED_FIELD',
      };
    }

    // Validate title length
    if (request.fields['System.Title'].length > 255) {
      return {
        valid: false,
        error: 'System.Title cannot exceed 255 characters',
        errorCode: 'INVALID_FIELD_VALUE',
      };
    }

    return { valid: true };
  }

  private validateUpdateRequest(request: UpdateWorkItemRequest): { valid: boolean; error?: string; errorCode?: string } {
    // Validate operations
    if (!request.operations || request.operations.length === 0) {
      return {
        valid: false,
        error: 'At least one operation is required for updates',
        errorCode: 'MISSING_OPERATIONS',
      };
    }

    // Validate each operation
    for (const operation of request.operations) {
      if (!['add', 'replace', 'remove'].includes(operation.op)) {
        return {
          valid: false,
          error: `Invalid operation: ${operation.op}`,
          errorCode: 'INVALID_OPERATION',
        };
      }

      // Validate state transitions
      if (operation.path === '/fields/System.State' && operation.value) {
        const validStates = ['New', 'Active', 'Resolved', 'Closed', 'Removed', 'In Progress', 'Done'];
        if (!validStates.includes(operation.value)) {
          return {
            valid: false,
            error: `Invalid state: ${operation.value}`,
            errorCode: 'INVALID_FIELD_VALUE',
          };
        }
      }
    }

    return { valid: true };
  }

  private convertToAgentError(error: any, operation: string, workItemId?: number): AgentError {
    const context = {
      operation,
      workItemId,
      timestamp: new Date(),
    };

    if (error.response) {
      const status = error.response.status;
      
      if (status === 404) {
        return {
          code: 'WORK_ITEM_NOT_FOUND',
          message: `Work item ${workItemId} not found`,
          category: 'API',
          severity: 'MEDIUM',
          context: { ...context, statusCode: status },
          userMessage: ERROR_MESSAGES.API.NOT_FOUND,
          recoverable: false,
        };
      }

      if (status === 409) {
        return {
          code: 'WORK_ITEM_CONFLICT',
          message: 'Work item has been modified by another user',
          category: 'API',
          severity: 'MEDIUM',
          context: { ...context, statusCode: status },
          userMessage: 'This work item has been modified by another user. Please refresh and try again.',
          recoverable: true,
        };
      }

      if (status >= 500) {
        return {
          code: 'API_SERVER_ERROR',
          message: 'Server error occurred',
          category: 'API',
          severity: 'HIGH',
          context: { ...context, statusCode: status },
          userMessage: ERROR_MESSAGES.API.SERVER_ERROR,
          recoverable: true,
        };
      }

      return {
        code: 'API_ERROR',
        message: `API error: ${status}`,
        category: 'API',
        severity: 'MEDIUM',
        context: { ...context, statusCode: status },
        userMessage: ERROR_MESSAGES.API.BAD_REQUEST,
        recoverable: false,
      };
    }

    // Network or other error
    return {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network error occurred',
      category: 'NETWORK',
      severity: 'HIGH',
      context,
      userMessage: ERROR_MESSAGES.NETWORK.CONNECTION_FAILED,
      recoverable: true,
    };
  }

  private recordMetric(operation: string, startTime: number, success: boolean, metadata?: Record<string, any>): void {
    const metric: PerformanceMetrics = {
      operation: `workitem.${operation}`,
      duration: Date.now() - startTime,
      success,
      timestamp: new Date(),
      metadata,
    };

    this.performanceMetrics.push(metric);
    
    // Keep only last 100 metrics
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100);
    }
  }

  private getOrganization(): string {
    // In a real implementation, this would get from auth service
    return 'test-org';
  }

  private getProject(): string {
    // In a real implementation, this would get from auth service
    return 'test-project';
  }
}