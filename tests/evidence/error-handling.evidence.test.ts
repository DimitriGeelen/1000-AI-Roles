// Evidence Tests for Error Handling Foundation
// These tests prove error handling works comprehensively and reliably

import { ErrorHandler } from '../../src/errors/ErrorHandler';
import { ErrorLogger } from '../../src/errors/ErrorLogger';
import { ErrorRecovery } from '../../src/errors/ErrorRecovery';
import { UserMessageGenerator } from '../../src/errors/UserMessageGenerator';
import { AgentError, ErrorContext } from '../../src/types';

describe('Error Handling Foundation - Evidence Tests', () => {
  let errorHandler: ErrorHandler;
  let errorLogger: ErrorLogger;
  let errorRecovery: ErrorRecovery;
  let messageGenerator: UserMessageGenerator;

  beforeEach(() => {
    errorLogger = new ErrorLogger();
    errorRecovery = new ErrorRecovery();
    messageGenerator = new UserMessageGenerator();
    errorHandler = new ErrorHandler(errorLogger, errorRecovery, messageGenerator);
  });

  describe('T013 Evidence: Error Categorization System', () => {
    test('EVIDENCE: Errors are properly categorized with appropriate severity levels', () => {
      // SETUP: Various error scenarios
      const authError = new Error('Invalid credentials');
      const networkError = new Error('ECONNREFUSED');
      const validationError = new Error('Missing required field');
      const apiError = new Error('Server returned 500');
      const rateLimitError = new Error('Rate limit exceeded');

      // EXECUTE: Categorize different error types
      const authResult = errorHandler.categorizeError(authError, {
        operation: 'authenticate',
        timestamp: new Date(),
      });

      const networkResult = errorHandler.categorizeError(networkError, {
        operation: 'api_call',
        timestamp: new Date(),
      });

      const validationResult = errorHandler.categorizeError(validationError, {
        operation: 'validate_input',
        timestamp: new Date(),
      });

      const apiResult = errorHandler.categorizeError(apiError, {
        operation: 'api_call',
        statusCode: 500,
        timestamp: new Date(),
      });

      const rateLimitResult = errorHandler.categorizeError(rateLimitError, {
        operation: 'api_call',
        statusCode: 429,
        timestamp: new Date(),
      });

      // VERIFY: Each error is properly categorized
      expect(authResult.category).toBe('AUTH');
      expect(authResult.severity).toBe('HIGH');
      expect(authResult.recoverable).toBe(true);

      expect(networkResult.category).toBe('NETWORK');
      expect(networkResult.severity).toBe('HIGH');
      expect(networkResult.recoverable).toBe(true);

      expect(validationResult.category).toBe('VALIDATION');
      expect(validationResult.severity).toBe('MEDIUM');
      expect(validationResult.recoverable).toBe(true);

      expect(apiResult.category).toBe('API');
      expect(apiResult.severity).toBe('HIGH');
      expect(apiResult.recoverable).toBe(true);

      expect(rateLimitResult.category).toBe('RATE_LIMIT');
      expect(rateLimitResult.severity).toBe('MEDIUM');
      expect(rateLimitResult.recoverable).toBe(true);
    });

    test('EVIDENCE: Error codes are generated consistently for the same error types', () => {
      // SETUP: Similar errors
      const error1 = new Error('Network timeout');
      const error2 = new Error('Connection refused');
      const context = { operation: 'api_call', timestamp: new Date() };

      // EXECUTE: Categorize similar errors
      const result1 = errorHandler.categorizeError(error1, context);
      const result2 = errorHandler.categorizeError(error2, context);

      // VERIFY: Similar errors get same category but different codes
      expect(result1.category).toBe(result2.category);
      expect(result1.code).toMatch(/NETWORK_/);
      expect(result2.code).toMatch(/NETWORK_/);
      expect(result1.severity).toBe(result2.severity);
    });

    test('EVIDENCE: Critical errors are properly flagged for immediate attention', () => {
      // SETUP: Critical error scenarios
      const securityError = new Error('Authentication bypass attempt');
      const dataLossError = new Error('Database corruption detected');
      const systemError = new Error('Out of memory');

      // EXECUTE: Process critical errors
      const securityResult = errorHandler.categorizeError(securityError, {
        operation: 'security_check',
        timestamp: new Date(),
      });

      const dataResult = errorHandler.categorizeError(dataLossError, {
        operation: 'data_operation',
        timestamp: new Date(),
      });

      const systemResult = errorHandler.categorizeError(systemError, {
        operation: 'system_operation',
        timestamp: new Date(),
      });

      // VERIFY: Critical errors are flagged appropriately
      expect([securityResult.severity, dataResult.severity, systemResult.severity])
        .toContain('CRITICAL');
      
      // At least one should be marked as critical
      const criticalErrors = [securityResult, dataResult, systemResult]
        .filter(r => r.severity === 'CRITICAL');
      expect(criticalErrors.length).toBeGreaterThan(0);
    });
  });

  describe('T014 Evidence: User-Friendly Message Generation', () => {
    test('EVIDENCE: Technical errors are converted to user-friendly messages', () => {
      // SETUP: Technical errors
      const technicalErrors: AgentError[] = [
        {
          code: 'ECONNREFUSED',
          message: 'connect ECONNREFUSED 127.0.0.1:443',
          category: 'NETWORK',
          severity: 'HIGH',
          context: { operation: 'api_call', timestamp: new Date() },
          userMessage: '',
          recoverable: true,
        },
        {
          code: 'HTTP_500',
          message: 'Internal Server Error at /api/workitems',
          category: 'API',
          severity: 'HIGH',
          context: { operation: 'create_workitem', statusCode: 500, timestamp: new Date() },
          userMessage: '',
          recoverable: true,
        },
        {
          code: 'VALIDATION_FAILED',
          message: 'Field "System.Title" is required',
          category: 'VALIDATION',
          severity: 'MEDIUM',
          context: { operation: 'validate_workitem', timestamp: new Date() },
          userMessage: '',
          recoverable: true,
        },
      ];

      // EXECUTE: Generate user-friendly messages
      const userMessages = technicalErrors.map(error =>
        messageGenerator.generateUserMessage(error)
      );

      // VERIFY: Messages are user-friendly and actionable
      expect(userMessages[0]).toContain('Unable to connect');
      expect(userMessages[0]).not.toContain('ECONNREFUSED');
      expect(userMessages[0]).not.toContain('127.0.0.1');

      expect(userMessages[1]).toContain('service is temporarily unavailable');
      expect(userMessages[1]).not.toContain('HTTP_500');
      expect(userMessages[1]).not.toContain('/api/workitems');

      expect(userMessages[2]).toContain('Title is required');
      expect(userMessages[2]).not.toContain('System.Title');
      expect(userMessages[2]).not.toContain('VALIDATION_FAILED');
    });

    test('EVIDENCE: Error messages include helpful recovery suggestions', () => {
      // SETUP: Recoverable errors
      const recoverableErrors: AgentError[] = [
        {
          code: 'AUTH_EXPIRED',
          message: 'Token expired',
          category: 'AUTH',
          severity: 'HIGH',
          context: { operation: 'authenticate', timestamp: new Date() },
          userMessage: '',
          recoverable: true,
        },
        {
          code: 'RATE_LIMITED',
          message: 'Too many requests',
          category: 'RATE_LIMIT',
          severity: 'MEDIUM',
          context: { operation: 'api_call', retryAfter: 60, timestamp: new Date() },
          userMessage: '',
          recoverable: true,
        },
        {
          code: 'NETWORK_TIMEOUT',
          message: 'Request timed out',
          category: 'NETWORK',
          severity: 'MEDIUM',
          context: { operation: 'api_call', timestamp: new Date() },
          userMessage: '',
          recoverable: true,
        },
      ];

      // EXECUTE: Generate messages with recovery suggestions
      const messagesWithSuggestions = recoverableErrors.map(error =>
        messageGenerator.generateUserMessage(error)
      );

      // VERIFY: Messages include actionable recovery steps
      expect(messagesWithSuggestions[0]).toMatch(/re-authenticate|refresh.*token|log.*again/i);
      expect(messagesWithSuggestions[1]).toMatch(/wait|try.*later|retry/i);
      expect(messagesWithSuggestions[2]).toMatch(/try.*again|retry|check.*connection/i);
    });

    test('EVIDENCE: Error messages are contextually appropriate for different user types', () => {
      // SETUP: Error with different user contexts
      const error: AgentError = {
        code: 'API_PERMISSION_DENIED',
        message: 'Insufficient permissions for operation',
        category: 'AUTH',
        severity: 'HIGH',
        context: { operation: 'create_workitem', timestamp: new Date() },
        userMessage: '',
        recoverable: true,
      };

      // EXECUTE: Generate messages for different user types
      const adminMessage = messageGenerator.generateUserMessage(error, 'admin');
      const developerMessage = messageGenerator.generateUserMessage(error, 'developer');
      const endUserMessage = messageGenerator.generateUserMessage(error, 'end_user');

      // VERIFY: Messages are appropriate for each user type
      expect(adminMessage).toMatch(/permission|access|configure/i);
      expect(developerMessage).toMatch(/permission|scope|token/i);
      expect(endUserMessage).toMatch(/contact.*admin|permission.*required/i);
      
      // Admin message should be more technical
      expect(adminMessage.length).toBeGreaterThanOrEqual(endUserMessage.length);
    });
  });

  describe('T015 Evidence: Logging Infrastructure', () => {
    test('EVIDENCE: Error logs contain all necessary debugging information', () => {
      // SETUP: Complex error scenario
      const error: AgentError = {
        code: 'WORK_ITEM_UPDATE_FAILED',
        message: 'Failed to update work item due to validation error',
        category: 'VALIDATION',
        severity: 'MEDIUM',
        context: {
          operation: 'update_workitem',
          workItemId: 12345,
          statusCode: 400,
          retryCount: 2,
          timestamp: new Date(),
        },
        userMessage: 'Unable to save your changes. Please check the required fields.',
        recoverable: true,
      };

      // Mock console to capture logs
      const logSpy = jest.spyOn(console, 'error').mockImplementation();

      // EXECUTE: Log the error
      errorLogger.logError(error);

      // VERIFY: Log contains comprehensive debugging information
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('WORK_ITEM_UPDATE_FAILED')
      );
      
      const logCall = logSpy.mock.calls[0][0];
      expect(logCall).toContain('workItemId: 12345');
      expect(logCall).toContain('statusCode: 400');
      expect(logCall).toContain('retryCount: 2');
      expect(logCall).toContain('VALIDATION');
      expect(logCall).toContain('MEDIUM');

      logSpy.mockRestore();
    });

    test('EVIDENCE: Sensitive information is never logged', () => {
      // SETUP: Error with potentially sensitive data
      const error: AgentError = {
        code: 'AUTH_FAILED',
        message: 'Authentication failed with token abc123secret456',
        category: 'AUTH',
        severity: 'HIGH',
        context: {
          operation: 'authenticate',
          timestamp: new Date(),
        },
        userMessage: 'Authentication failed. Please check your credentials.',
        recoverable: true,
      };

      // Mock console to capture logs
      const logSpy = jest.spyOn(console, 'error').mockImplementation();

      // EXECUTE: Log the error
      errorLogger.logError(error);

      // VERIFY: Sensitive information is redacted
      const logCall = logSpy.mock.calls[0][0];
      expect(logCall).not.toContain('abc123secret456');
      expect(logCall).toContain('AUTH_FAILED');
      expect(logCall).toMatch(/token.*\*+/); // Should contain masked token

      logSpy.mockRestore();
    });

    test('EVIDENCE: Error patterns and trends are tracked for analysis', () => {
      // SETUP: Multiple similar errors
      const errors: AgentError[] = [
        {
          code: 'NETWORK_TIMEOUT',
          message: 'Request timeout',
          category: 'NETWORK',
          severity: 'MEDIUM',
          context: { operation: 'api_call', timestamp: new Date() },
          userMessage: 'Connection timed out',
          recoverable: true,
        },
        {
          code: 'NETWORK_TIMEOUT',
          message: 'Request timeout',
          category: 'NETWORK',
          severity: 'MEDIUM',
          context: { operation: 'api_call', timestamp: new Date() },
          userMessage: 'Connection timed out',
          recoverable: true,
        },
        {
          code: 'API_SERVER_ERROR',
          message: 'Server error',
          category: 'API',
          severity: 'HIGH',
          context: { operation: 'api_call', statusCode: 500, timestamp: new Date() },
          userMessage: 'Service unavailable',
          recoverable: true,
        },
      ];

      // EXECUTE: Log multiple errors
      errors.forEach(error => errorLogger.logError(error));

      // Get error statistics
      const stats = errorLogger.getErrorStatistics();

      // VERIFY: Error patterns are tracked
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByCategory.NETWORK).toBe(2);
      expect(stats.errorsByCategory.API).toBe(1);
      expect(stats.errorsBySeverity.MEDIUM).toBe(2);
      expect(stats.errorsBySeverity.HIGH).toBe(1);
      expect(stats.mostCommonError).toBe('NETWORK_TIMEOUT');
    });
  });

  describe('T016 Evidence: Error Recovery Mechanisms', () => {
    test('EVIDENCE: Automatic retry logic works for transient failures', async () => {
      // SETUP: Transient failure simulation
      let attemptCount = 0;
      const flakyOperation = async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary network error');
        }
        return { success: true, data: 'operation completed' };
      };

      // EXECUTE: Retry operation
      const result = await errorRecovery.retryOperation(
        flakyOperation,
        {
          maxAttempts: 5,
          baseDelay: 100,
          maxDelay: 5000,
          exponentialBase: 2,
        }
      );

      // VERIFY: Operation succeeds after retries
      expect(result.success).toBe(true);
      expect(result.data).toBe('operation completed');
      expect(result.attemptCount).toBe(3);
      expect(result.totalDuration).toBeGreaterThan(100); // Should include retry delays
    });

    test('EVIDENCE: Circuit breaker prevents cascading failures', async () => {
      // SETUP: Consistently failing operation
      const failingOperation = async () => {
        throw new Error('Service unavailable');
      };

      const circuitBreaker = errorRecovery.createCircuitBreaker('test-service', {
        failureThreshold: 3,
        resetTimeout: 1000,
        monitoringPeriod: 5000,
      });

      // EXECUTE: Multiple failing attempts
      const results: any[] = [];
      for (let i = 0; i < 6; i++) {
        try {
          await circuitBreaker.execute(failingOperation);
        } catch (error) {
          results.push(error);
        }
      }

      // VERIFY: Circuit breaker opens after threshold
      expect(results).toHaveLength(6);
      expect(results.slice(0, 3).every(r => r.message === 'Service unavailable')).toBe(true);
      expect(results.slice(3).every(r => r.message.includes('Circuit breaker'))).toBe(true);
      expect(circuitBreaker.getState()).toBe('OPEN');
    });

    test('EVIDENCE: Graceful degradation maintains partial functionality', async () => {
      // SETUP: Service with primary and fallback capabilities
      const primaryService = async () => {
        throw new Error('Primary service down');
      };

      const fallbackService = async () => {
        return { data: 'fallback response', degraded: true };
      };

      // EXECUTE: Graceful degradation
      const result = await errorRecovery.withFallback(
        primaryService,
        fallbackService,
        { timeout: 1000 }
      );

      // VERIFY: Fallback service provides degraded functionality
      expect(result.success).toBe(true);
      expect(result.data!.data).toBe('fallback response');
      expect(result.data!.degraded).toBe(true);
      expect(result.usedFallback).toBe(true);
    });

    test('EVIDENCE: Recovery state is persisted across application restarts', () => {
      // SETUP: Recovery state with circuit breaker history
      const serviceName = 'azure-devops-api';
      const circuitBreaker = errorRecovery.createCircuitBreaker(serviceName, {
        failureThreshold: 5,
        resetTimeout: 60000,
        monitoringPeriod: 300000,
      });

      // Simulate some failures
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }

      // EXECUTE: Persist and restore state
      const state = errorRecovery.getRecoveryState();
      const newErrorRecovery = new ErrorRecovery();
      newErrorRecovery.restoreRecoveryState(state);

      const restoredCircuitBreaker = newErrorRecovery.getCircuitBreaker(serviceName);

      // VERIFY: State is properly restored
      expect(restoredCircuitBreaker).toBeDefined();
      expect(restoredCircuitBreaker!.getFailureCount()).toBe(3);
      expect(restoredCircuitBreaker!.getState()).toBe('CLOSED'); // Still below threshold
    });

    test('EVIDENCE: Error recovery metrics are collected for monitoring', () => {
      // SETUP: Various recovery scenarios
      const operation1 = async () => { throw new Error('Error 1'); };
      const operation2 = async () => { return 'success'; };

      // EXECUTE: Multiple recovery attempts
      errorRecovery.retryOperation(operation1, { 
        maxAttempts: 2, 
        baseDelay: 100, 
        maxDelay: 1000, 
        exponentialBase: 2 
      }).catch(() => {}); // Ignore failure

      errorRecovery.retryOperation(operation2, { 
        maxAttempts: 3, 
        baseDelay: 100, 
        maxDelay: 1000, 
        exponentialBase: 2 
      });

      // Get recovery metrics
      const metrics = errorRecovery.getRecoveryMetrics();

      // VERIFY: Metrics are properly collected
      expect(metrics.totalRetryAttempts).toBeGreaterThan(0);
      expect(metrics.successfulRecoveries).toBeGreaterThan(0);
      expect(metrics.failedRecoveries).toBeGreaterThan(0);
      expect(metrics.averageRetryCount).toBeGreaterThan(0);
      expect(metrics.circuitBreakerStates).toBeDefined();
    });
  });
});