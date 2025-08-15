// Evidence Tests for Work Item Operations
// These tests prove work item CRUD operations work reliably

import { WorkItemService } from '../../src/workitem/WorkItemService';
import { ApiClient } from '../../src/client/ApiClient';
import { AuthService } from '../../src/auth/AuthService';
import { ConfigurationManager } from '../../src/config/ConfigurationManager';
import { CreateWorkItemRequest, UpdateWorkItemRequest, WorkItem, AuthConfig } from '../../src/types';

// Mock the ApiClient
jest.mock('../../src/client/ApiClient');
const MockedApiClient = ApiClient as jest.MockedClass<typeof ApiClient>;

describe('Work Item Operations - Evidence Tests', () => {
  let workItemService: WorkItemService;
  let mockApiClient: jest.Mocked<ApiClient>;
  let authService: AuthService;
  let configManager: ConfigurationManager;

  beforeEach(async () => {
    // Setup auth
    configManager = new ConfigurationManager();
    authService = new AuthService(configManager);
    const authConfig: AuthConfig = {
      organization: 'test-org',
      personalAccessToken: 'test-pat-token-123',
      project: 'test-project',
    };
    await authService.configure(authConfig);

    // Setup mocked API client
    mockApiClient = new MockedApiClient(authService, configManager) as jest.Mocked<ApiClient>;
    workItemService = new WorkItemService(mockApiClient);

    jest.clearAllMocks();
  });

  describe('T009 Evidence: Create Work Item Functionality', () => {
    test('EVIDENCE: New work items are created with all required fields and proper validation', async () => {
      // SETUP: Valid work item creation request
      const createRequest: CreateWorkItemRequest = {
        workItemType: 'User Story',
        fields: {
          'System.Title': 'Test User Story',
          'System.Description': 'This is a test user story for validation',
          'System.State': 'New',
          'System.Priority': 2,
        },
      };

      const mockResponse = {
        data: {
          id: 123,
          fields: {
            'System.Id': 123,
            'System.Title': 'Test User Story',
            'System.Description': 'This is a test user story for validation',
            'System.State': 'New',
            'System.Priority': 2,
            'System.CreatedDate': '2024-01-01T10:00:00Z',
            'System.WorkItemType': 'User Story',
          },
        },
        status: 200,
        headers: {},
        duration: 250,
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      // EXECUTE: Create work item
      const result = await workItemService.createWorkItem(createRequest);

      // VERIFY: Work item is created successfully with proper validation
      expect(result.success).toBe(true);
      expect(result.workItem?.id).toBe(123);
      expect(result.workItem?.fields['System.Title']).toBe('Test User Story');
      expect(result.duration).toBeLessThan(5000); // < 5 seconds
      
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/test-org/test-project/_apis/wit/workitems/$User Story',
        expect.arrayContaining([
          expect.objectContaining({
            op: 'add',
            path: '/fields/System.Title',
            value: 'Test User Story',
          }),
        ]),
        expect.objectContaining({
          'api-version': '7.0',
        })
      );
    });

    test('EVIDENCE: Required field validation prevents invalid work item creation', async () => {
      // SETUP: Invalid work item request (missing title)
      const invalidRequest: CreateWorkItemRequest = {
        workItemType: 'User Story',
        fields: {
          'System.Description': 'Story without title',
          // Missing System.Title
        },
      };

      // EXECUTE: Attempt to create invalid work item
      const result = await workItemService.createWorkItem(invalidRequest);

      // VERIFY: Creation is rejected with validation error
      expect(result.success).toBe(false);
      expect(result.error?.category).toBe('VALIDATION');
      expect(result.error?.code).toBe('MISSING_REQUIRED_FIELD');
      expect(result.error?.message).toContain('System.Title');
      expect(result.error?.recoverable).toBe(true);
      
      // Should not make API call for invalid request
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    test('EVIDENCE: Work item types are validated against project configuration', async () => {
      // SETUP: Request with invalid work item type
      const invalidTypeRequest: CreateWorkItemRequest = {
        workItemType: 'Invalid Type',
        fields: {
          'System.Title': 'Test Item',
        },
      };

      // EXECUTE: Attempt to create work item with invalid type
      const result = await workItemService.createWorkItem(invalidTypeRequest);

      // VERIFY: Invalid type is rejected
      expect(result.success).toBe(false);
      expect(result.error?.category).toBe('VALIDATION');
      expect(result.error?.code).toBe('INVALID_WORK_ITEM_TYPE');
      expect(result.error?.message).toContain('Invalid Type');
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('T010 Evidence: Read Work Item Operations', () => {
    test('EVIDENCE: Work items are retrieved with complete field data and relationships', async () => {
      // SETUP: Mock work item response with relations
      const mockResponse = {
        data: {
          id: 456,
          fields: {
            'System.Id': 456,
            'System.Title': 'Retrieved Work Item',
            'System.Description': 'Full work item with relations',
            'System.State': 'Active',
            'System.AssignedTo': 'test.user@example.com',
            'System.Tags': 'important; frontend',
          },
          relations: [
            {
              rel: 'System.LinkTypes.Hierarchy-Forward',
              url: 'https://dev.azure.com/test-org/_apis/wit/workItems/789',
              attributes: {
                name: 'Child',
              },
            },
          ],
        },
        status: 200,
        headers: {},
        duration: 180,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      // EXECUTE: Retrieve work item
      const result = await workItemService.getWorkItem(456);

      // VERIFY: Complete work item data is retrieved
      expect(result.success).toBe(true);
      expect(result.workItem?.id).toBe(456);
      expect(result.workItem?.fields['System.Title']).toBe('Retrieved Work Item');
      expect(result.workItem?.relations).toHaveLength(1);
      expect(result.workItem?.relations?.[0].rel).toBe('System.LinkTypes.Hierarchy-Forward');
      expect(result.duration).toBeLessThan(5000);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/test-org/test-project/_apis/wit/workitems/456',
        expect.objectContaining({
          '$expand': 'Relations',
          'api-version': '7.0',
        })
      );
    });

    test('EVIDENCE: Non-existent work items return appropriate not found response', async () => {
      // SETUP: Mock 404 response
      const notFoundError = new Error('Work item not found');
      (notFoundError as any).response = { status: 404 };
      mockApiClient.get.mockRejectedValue(notFoundError);

      // EXECUTE: Attempt to retrieve non-existent work item
      const result = await workItemService.getWorkItem(99999);

      // VERIFY: Not found is handled gracefully
      expect(result.success).toBe(false);
      expect(result.error?.category).toBe('API');
      expect(result.error?.code).toBe('WORK_ITEM_NOT_FOUND');
      expect(result.error?.userMessage).toContain('not found');
      expect(result.error?.recoverable).toBe(false);
    });

    test('EVIDENCE: Bulk work item retrieval handles large datasets efficiently', async () => {
      // SETUP: Mock bulk response
      const workItemIds = [1, 2, 3, 4, 5];
      const mockResponse = {
        data: {
          value: workItemIds.map(id => ({
            id,
            fields: {
              'System.Id': id,
              'System.Title': `Work Item ${id}`,
              'System.State': 'New',
            },
          })),
        },
        status: 200,
        headers: {},
        duration: 300,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      // EXECUTE: Retrieve multiple work items
      const result = await workItemService.getWorkItems(workItemIds);

      // VERIFY: All work items are retrieved efficiently
      expect(result.success).toBe(true);
      expect(result.workItems).toHaveLength(5);
      expect(result.duration).toBeLessThan(5000);
      
      // Verify API was called with proper batch request
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/test-org/test-project/_apis/wit/workitems',
        expect.objectContaining({
          'ids': '1,2,3,4,5',
          '$expand': 'Relations',
          'api-version': '7.0',
        })
      );
    });
  });

  describe('T011 Evidence: Update Work Item Logic', () => {
    test('EVIDENCE: Work item fields are updated with proper change tracking and validation', async () => {
      // SETUP: Valid update request
      const updateRequest: UpdateWorkItemRequest = {
        id: 789,
        operations: [
          {
            op: 'replace',
            path: '/fields/System.Title',
            value: 'Updated Title',
          },
          {
            op: 'replace',
            path: '/fields/System.State',
            value: 'In Progress',
          },
          {
            op: 'add',
            path: '/fields/System.Tags',
            value: 'updated; testing',
          },
        ],
      };

      const mockResponse = {
        data: {
          id: 789,
          fields: {
            'System.Id': 789,
            'System.Title': 'Updated Title',
            'System.State': 'In Progress',
            'System.Tags': 'updated; testing',
            'System.ChangedDate': '2024-01-01T11:00:00Z',
          },
        },
        status: 200,
        headers: {},
        duration: 220,
      };

      mockApiClient.patch.mockResolvedValue(mockResponse);

      // EXECUTE: Update work item
      const result = await workItemService.updateWorkItem(updateRequest);

      // VERIFY: Work item is updated successfully
      expect(result.success).toBe(true);
      expect(result.workItem?.id).toBe(789);
      expect(result.workItem?.fields['System.Title']).toBe('Updated Title');
      expect(result.workItem?.fields['System.State']).toBe('In Progress');
      expect(result.duration).toBeLessThan(5000);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/test-org/test-project/_apis/wit/workitems/789',
        updateRequest.operations,
        expect.objectContaining({
          'api-version': '7.0',
        })
      );
    });

    test('EVIDENCE: Field value validation prevents invalid updates', async () => {
      // SETUP: Invalid update with wrong state transition
      const invalidUpdate: UpdateWorkItemRequest = {
        id: 789,
        operations: [
          {
            op: 'replace',
            path: '/fields/System.State',
            value: 'Invalid State',
          },
        ],
      };

      // EXECUTE: Attempt invalid update
      const result = await workItemService.updateWorkItem(invalidUpdate);

      // VERIFY: Invalid update is rejected
      expect(result.success).toBe(false);
      expect(result.error?.category).toBe('VALIDATION');
      expect(result.error?.code).toBe('INVALID_FIELD_VALUE');
      expect(result.error?.message).toContain('Invalid State');
      expect(mockApiClient.patch).not.toHaveBeenCalled();
    });

    test('EVIDENCE: Concurrent update conflicts are detected and handled', async () => {
      // SETUP: Mock conflict response (409)
      const conflictError = new Error('Conflict');
      (conflictError as any).response = { 
        status: 409,
        data: { message: 'Work item has been modified by another user' },
      };
      mockApiClient.patch.mockRejectedValue(conflictError);

      const updateRequest: UpdateWorkItemRequest = {
        id: 789,
        operations: [
          {
            op: 'replace',
            path: '/fields/System.Title',
            value: 'Conflicting Update',
          },
        ],
      };

      // EXECUTE: Attempt update that causes conflict
      const result = await workItemService.updateWorkItem(updateRequest);

      // VERIFY: Conflict is handled appropriately
      expect(result.success).toBe(false);
      expect(result.error?.category).toBe('API');
      expect(result.error?.code).toBe('WORK_ITEM_CONFLICT');
      expect(result.error?.userMessage).toContain('modified by another user');
      expect(result.error?.recoverable).toBe(true);
    });
  });

  describe('T012 Evidence: CRUD Testing Validation', () => {
    test('EVIDENCE: Complete CRUD workflow maintains data consistency and reliability', async () => {
      // SETUP: Complete workflow mocks
      const createResponse = {
        data: { id: 100, fields: { 'System.Id': 100, 'System.Title': 'CRUD Test Item' } },
        status: 200, headers: {}, duration: 200,
      };
      
      const readResponse = {
        data: { id: 100, fields: { 'System.Id': 100, 'System.Title': 'CRUD Test Item' } },
        status: 200, headers: {}, duration: 150,
      };
      
      const updateResponse = {
        data: { id: 100, fields: { 'System.Id': 100, 'System.Title': 'Updated CRUD Item' } },
        status: 200, headers: {}, duration: 180,
      };

      mockApiClient.post.mockResolvedValueOnce(createResponse);
      mockApiClient.get.mockResolvedValueOnce(readResponse);
      mockApiClient.patch.mockResolvedValueOnce(updateResponse);
      mockApiClient.delete.mockResolvedValueOnce({ data: {}, status: 200, headers: {}, duration: 120 });

      // EXECUTE: Complete CRUD workflow
      const createResult = await workItemService.createWorkItem({
        workItemType: 'Task',
        fields: { 'System.Title': 'CRUD Test Item' },
      });

      const readResult = await workItemService.getWorkItem(100);

      const updateResult = await workItemService.updateWorkItem({
        id: 100,
        operations: [{ op: 'replace', path: '/fields/System.Title', value: 'Updated CRUD Item' }],
      });

      const deleteResult = await workItemService.deleteWorkItem(100);

      // VERIFY: All operations succeed with proper data flow
      expect(createResult.success).toBe(true);
      expect(readResult.success).toBe(true);
      expect(updateResult.success).toBe(true);
      expect(deleteResult.success).toBe(true);

      // Verify proper API calls were made
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      expect(mockApiClient.patch).toHaveBeenCalledTimes(1);
      expect(mockApiClient.delete).toHaveBeenCalledTimes(1);

      // Verify all operations completed within performance targets
      const totalTime = createResult.duration! + readResult.duration! + 
                       updateResult.duration! + deleteResult.duration!;
      expect(totalTime).toBeLessThan(5000); // Total workflow < 5 seconds
    });

    test('EVIDENCE: Error scenarios are handled consistently across all CRUD operations', async () => {
      // SETUP: Error scenarios for each operation
      const networkError = new Error('Network Error');
      const validationError = new Error('Validation Error');
      
      mockApiClient.post.mockRejectedValueOnce(networkError);
      mockApiClient.get.mockRejectedValueOnce(networkError);
      mockApiClient.patch.mockRejectedValueOnce(validationError);
      mockApiClient.delete.mockRejectedValueOnce(networkError);

      // EXECUTE: Operations that will fail
      const createResult = await workItemService.createWorkItem({
        workItemType: 'Task',
        fields: { 'System.Title': 'Test' },
      });

      const readResult = await workItemService.getWorkItem(999);

      const updateResult = await workItemService.updateWorkItem({
        id: 999,
        operations: [{ op: 'replace', path: '/fields/System.Title', value: 'Test' }],
      });

      const deleteResult = await workItemService.deleteWorkItem(999);

      // VERIFY: All errors are handled consistently
      expect(createResult.success).toBe(false);
      expect(readResult.success).toBe(false);
      expect(updateResult.success).toBe(false);
      expect(deleteResult.success).toBe(false);

      // All should have proper error structure
      [createResult, readResult, updateResult, deleteResult].forEach(result => {
        expect(result.error).toBeDefined();
        expect(result.error?.category).toBeDefined();
        expect(result.error?.code).toBeDefined();
        expect(result.error?.userMessage).toBeDefined();
        expect(result.error?.recoverable).toBeDefined();
      });
    });

    test('EVIDENCE: Performance metrics are collected for all CRUD operations', async () => {
      // SETUP: Create fresh service to avoid metrics from previous tests
      const freshWorkItemService = new WorkItemService(mockApiClient);
      
      // Mock responses with varying durations
      mockApiClient.post.mockResolvedValue({ 
        data: { id: 123, fields: { 'System.Id': 123, 'System.Title': 'Test' } }, 
        status: 200, headers: {}, duration: 250 
      });
      mockApiClient.get.mockResolvedValue({ 
        data: { id: 123, fields: { 'System.Id': 123, 'System.Title': 'Test' } }, 
        status: 200, headers: {}, duration: 150 
      });
      mockApiClient.patch.mockResolvedValue({ 
        data: { id: 123, fields: { 'System.Id': 123, 'System.Title': 'Updated' } }, 
        status: 200, headers: {}, duration: 300 
      });
      mockApiClient.delete.mockResolvedValue({ data: {}, status: 200, headers: {}, duration: 100 });

      // EXECUTE: Operations to collect metrics
      await freshWorkItemService.createWorkItem({ workItemType: 'Task', fields: { 'System.Title': 'Test' } });
      await freshWorkItemService.getWorkItem(123);
      await freshWorkItemService.updateWorkItem({ 
        id: 123, 
        operations: [{ op: 'replace', path: '/fields/System.Title', value: 'Updated' }] 
      });
      await freshWorkItemService.deleteWorkItem(123);

      const metrics = freshWorkItemService.getPerformanceMetrics();

      // VERIFY: Performance metrics are properly collected
      expect(metrics).toHaveLength(4);
      expect(metrics.some(m => m.operation.includes('create'))).toBe(true);
      expect(metrics.some(m => m.operation.includes('read'))).toBe(true);
      expect(metrics.some(m => m.operation.includes('update'))).toBe(true);
      expect(metrics.some(m => m.operation.includes('delete'))).toBe(true);

      // All operations should have succeeded
      const successfulMetrics = metrics.filter(m => m.success);
      expect(successfulMetrics).toHaveLength(4);

      successfulMetrics.forEach(metric => {
        expect(metric.duration).toBeGreaterThanOrEqual(0); // Mocked calls can be instant
        expect(metric.success).toBe(true);
        expect(metric.timestamp).toBeInstanceOf(Date);
      });
    });
  });
});