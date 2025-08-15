// Evidence Tests for API Client
// These tests prove the API client works efficiently and reliably

import { ApiClient } from '../../src/client/ApiClient';
import { AuthService } from '../../src/auth/AuthService';
import { ConfigurationManager } from '../../src/config/ConfigurationManager';
import { AuthConfig, ApiResponse } from '../../src/types';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create a proper mock instance
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  request: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
};

mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

describe('API Client - Evidence Tests', () => {
  let apiClient: ApiClient;
  let authService: AuthService;
  let configManager: ConfigurationManager;

  beforeEach(async () => {
    configManager = new ConfigurationManager();
    authService = new AuthService(configManager);
    
    // Configure auth for testing
    const authConfig: AuthConfig = {
      organization: 'test-org',
      personalAccessToken: 'test-pat-token-123',
    };
    await authService.configure(authConfig);
    
    apiClient = new ApiClient(authService, configManager);
    jest.clearAllMocks();
  });

  describe('T005 Evidence: HTTP Client with Azure DevOps Integration', () => {
    test('EVIDENCE: HTTP client makes authenticated requests to Azure DevOps API', async () => {
      // SETUP: Mock successful API response
      const mockResponse = {
        data: { value: [{ id: 1, fields: { 'System.Title': 'Test Work Item' } }] },
        status: 200,
        headers: { 'content-type': 'application/json' },
        config: {},
        statusText: 'OK',
      };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      // EXECUTE: Make API request
      const response = await apiClient.get('/test-org/_apis/wit/workitems', {
        $expand: 'Fields',
      });

      // VERIFY: Request is properly authenticated and formatted
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.duration).toBeLessThan(5000); // < 5 seconds
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/test-org/_apis/wit/workitems',
          params: { $expand: 'Fields' },
        })
      );
    });

    test('EVIDENCE: Base URL and headers are correctly configured for Azure DevOps', async () => {
      // SETUP: Initialize API client
      const config = apiClient.getConfiguration();

      // VERIFY: Configuration matches Azure DevOps requirements
      expect(config.baseUrl).toBe('https://dev.azure.com');
      expect(config.timeout).toBe(30000);
      expect(config.headers).toEqual(
        expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': expect.stringContaining('azure-devops-agent'),
        })
      );
    });
  });

  describe('T006 Evidence: Rate Limiting with Token Bucket Algorithm', () => {
    test('EVIDENCE: Rate limiting prevents API abuse and respects limits', async () => {
      // SETUP: Configure rate limiting (100 requests per minute)
      const startTime = Date.now();
      const requests: Promise<ApiResponse>[] = [];
      
      // Mock responses
      mockAxiosInstance.request.mockResolvedValue({
        data: { test: 'data' },
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK',
      });

      // EXECUTE: Make many requests quickly
      for (let i = 0; i < 10; i++) {
        requests.push(apiClient.get(`/test-org/_apis/wit/workitems/${i}`));
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();

      // VERIFY: Rate limiting is applied
      expect(responses).toHaveLength(10);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Check that requests were spaced out due to rate limiting
      const timeTaken = endTime - startTime;
      expect(timeTaken).toBeGreaterThan(50); // Should take some time due to rate limiting
    });

    test('EVIDENCE: Rate limit information is tracked and exposed', async () => {
      // SETUP: Make some requests
      mockAxiosInstance.request.mockResolvedValue({
        data: { test: 'data' },
        status: 200,
        headers: {
          'x-ratelimit-remaining': '95',
          'x-ratelimit-reset': String(Date.now() + 60000),
          'x-ratelimit-limit': '100',
        },
        config: {},
        statusText: 'OK',
      });

      // EXECUTE: Make request and get rate limit info
      await apiClient.get('/test-org/_apis/wit/workitems/1');
      const rateLimitInfo = apiClient.getRateLimitInfo();

      // VERIFY: Rate limit information is available
      expect(rateLimitInfo).toBeDefined();
      expect(rateLimitInfo.remaining).toBeGreaterThanOrEqual(0);
      expect(rateLimitInfo.limit).toBeGreaterThan(0);
      expect(rateLimitInfo.resetTime).toBeInstanceOf(Date);
    });
  });

  describe('T007 Evidence: Error Handling and Retry Logic', () => {
    test('EVIDENCE: Network errors trigger retry with exponential backoff', async () => {
      // SETUP: Mock network error then success
      mockAxiosInstance.request
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce({
          data: { success: true },
          status: 200,
          headers: {},
          config: {},
          statusText: 'OK',
        });

      const startTime = Date.now();

      // EXECUTE: Make request that will retry
      const response = await apiClient.get('/test-org/_apis/wit/workitems/1');
      const endTime = Date.now();

      // VERIFY: Request eventually succeeds with retry
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3); // 2 failures + 1 success
      
      // Verify exponential backoff occurred
      expect(endTime - startTime).toBeGreaterThan(1000); // At least 1 second for retries
    });

    test('EVIDENCE: HTTP 429 (rate limit) responses are handled gracefully', async () => {
      // SETUP: Mock rate limit response
      const rateLimitError = new Error('Rate limited');
      (rateLimitError as any).response = {
        status: 429,
        data: { message: 'Rate limit exceeded' },
        headers: { 'retry-after': '60' },
      };
      
      // Mock already configured
      mockAxiosInstance.request.mockRejectedValue(rateLimitError);

      // EXECUTE: Make request that hits rate limit
      try {
        await apiClient.get('/test-org/_apis/wit/workitems/1');
        fail('Should have thrown rate limit error');
      } catch (error: any) {
        // VERIFY: Error is properly categorized and has retry information
        expect(error.category).toBe('RATE_LIMIT');
        expect(error.code).toBe('API_RATE_LIMITED');
        expect(error.userMessage).toContain('rate limit');
        expect(error.recoverable).toBe(true);
        expect(error.context.retryAfter).toBe(60);
      }
    });

    test('EVIDENCE: Server errors (5xx) are retried but client errors (4xx) are not', async () => {
      // SETUP: Test server error (should retry)
      // Mock already configured
      const serverError = new Error('Server Error');
      (serverError as any).response = { status: 500, data: { message: 'Internal Server Error' } };
      (serverError as any).config = { method: 'GET', url: '/test-org/_apis/wit/workitems/1' };
      
      mockAxiosInstance.request
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce({
          data: { success: true },
          status: 200,
          headers: {},
          config: {},
          statusText: 'OK',
        });

      // EXECUTE: Make request that gets server error then succeeds
      const response = await apiClient.get('/test-org/_apis/wit/workitems/1');

      // VERIFY: Server error was retried and succeeded
      expect(response.status).toBe(200);
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);

      // SETUP: Test client error (should not retry)
      jest.clearAllMocks();
      const notFoundError = new Error('Not Found');
      (notFoundError as any).response = { status: 404, data: { message: 'Not Found' } };
      mockAxiosInstance.request.mockRejectedValue(notFoundError);

      // EXECUTE: Make request that gets client error
      try {
        await apiClient.get('/test-org/_apis/wit/workitems/999');
        fail('Should have thrown client error');
      } catch (error: any) {
        // VERIFY: Client error was not retried
        expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1); // No retries
        expect(error.category).toBe('API');
        expect(error.code).toBe('API_NOT_FOUND');
      }
    });
  });

  describe('T008 Evidence: Connectivity Monitoring', () => {
    test('EVIDENCE: Connection health is monitored and reported', async () => {
      // SETUP: Make some requests to establish baseline
      // Mock already configured
      mockAxiosInstance.request.mockResolvedValue({
        data: { test: 'data' },
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK',
      });

      // EXECUTE: Make several requests
      await apiClient.get('/test-org/_apis/wit/workitems/1');
      await apiClient.get('/test-org/_apis/wit/workitems/2');
      await apiClient.get('/test-org/_apis/wit/workitems/3');

      // Get health status
      const healthStatus = apiClient.getHealthStatus();

      // VERIFY: Health monitoring data is available
      expect(healthStatus.isHealthy).toBe(true);
      expect(healthStatus.successRate).toBeGreaterThan(0.9); // > 90% success rate
      expect(healthStatus.averageResponseTime).toBeLessThan(5000); // < 5 seconds
      expect(healthStatus.totalRequests).toBe(3);
      expect(healthStatus.successfulRequests).toBe(3);
      expect(healthStatus.failedRequests).toBe(0);
      expect(healthStatus.lastSuccessfulRequest).toBeInstanceOf(Date);
    });

    test('EVIDENCE: Performance metrics are collected and retrievable', async () => {
      // SETUP: Make request with timing
      // Mock already configured
      mockAxiosInstance.request.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            data: { test: 'data' },
            status: 200,
            headers: {},
            config: {},
            statusText: 'OK',
          }), 100)
        )
      );

      // EXECUTE: Make request and collect metrics
      await apiClient.get('/test-org/_apis/wit/workitems/1');
      const metrics = apiClient.getPerformanceMetrics();

      // VERIFY: Performance data is captured
      expect(metrics).toBeDefined();
      expect(metrics.length).toBeGreaterThan(0);
      
      const lastMetric = metrics[metrics.length - 1];
      expect(lastMetric.operation).toContain('GET');
      expect(lastMetric.duration).toBeGreaterThan(90); // Should reflect the 100ms delay
      expect(lastMetric.success).toBe(true);
      expect(lastMetric.timestamp).toBeInstanceOf(Date);
    });

    test('EVIDENCE: Circuit breaker prevents cascading failures', async () => {
      // SETUP: Configure many consecutive failures
      // Mock already configured
      mockAxiosInstance.request.mockRejectedValue(new Error('Service Unavailable'));

      let circuitOpenError: any;

      // EXECUTE: Make many failing requests to trigger circuit breaker
      for (let i = 0; i < 10; i++) {
        try {
          await apiClient.get('/test-org/_apis/wit/workitems/1');
        } catch (error) {
          circuitOpenError = error;
        }
      }

      // VERIFY: Circuit breaker opens after repeated failures
      const healthStatus = apiClient.getHealthStatus();
      expect(healthStatus.isHealthy).toBe(false);
      expect(healthStatus.circuitBreakerOpen).toBe(true);
      expect(circuitOpenError.category).toBe('NETWORK');
      expect(circuitOpenError.userMessage).toContain('service unavailable');
    });
  });
});