// API Client for Azure DevOps with rate limiting and error handling

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { AuthService } from '../auth/AuthService';
import { ConfigurationManager } from '../config/ConfigurationManager';
import { TokenBucketRateLimiter, RateLimitInfo } from './RateLimiter';
import { CircuitBreaker, CircuitState } from './CircuitBreaker';
import { ApiResponse, AgentError, PerformanceMetrics } from '../types';
import { ERROR_MESSAGES } from '../config/default';

export interface HealthStatus {
  isHealthy: boolean;
  successRate: number;
  averageResponseTime: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastSuccessfulRequest?: Date;
  lastFailedRequest?: Date;
  circuitBreakerOpen: boolean;
}

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
}

export class ApiClient {
  private httpClient: AxiosInstance;
  private authService: AuthService;
  private configManager: ConfigurationManager;
  private rateLimiter: TokenBucketRateLimiter;
  private circuitBreaker: CircuitBreaker;
  private performanceMetrics: PerformanceMetrics[] = [];
  private healthMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalResponseTime: 0,
    lastSuccessfulRequest: null as Date | null,
    lastFailedRequest: null as Date | null,
  };

  constructor(authService: AuthService, configManager?: ConfigurationManager) {
    this.authService = authService;
    this.configManager = configManager || ConfigurationManager.getInstance();
    
    const config = this.configManager.getApiClientConfig();
    
    // Initialize rate limiter
    this.rateLimiter = new TokenBucketRateLimiter(config.rateLimit);
    
    // Initialize circuit breaker
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
    });

    // Create HTTP client
    this.httpClient = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'azure-devops-agent/0.1.0',
      },
    });

    this.setupInterceptors();
  }

  public async get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', url, undefined, params);
  }

  public async post<T = any>(url: string, data?: any, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', url, data, params);
  }

  public async patch<T = any>(url: string, data?: any, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', url, data, params);
  }

  public async delete<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', url, undefined, params);
  }

  public getConfiguration(): ApiClientConfig {
    const config = this.configManager.getApiClientConfig();
    return {
      baseUrl: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'azure-devops-agent/0.1.0',
      },
    };
  }

  public getRateLimitInfo(): RateLimitInfo {
    return this.rateLimiter.getRateLimitInfo();
  }

  public getHealthStatus(): HealthStatus {
    const successRate = this.healthMetrics.totalRequests > 0 
      ? this.healthMetrics.successfulRequests / this.healthMetrics.totalRequests 
      : 1;
    
    const averageResponseTime = this.healthMetrics.successfulRequests > 0
      ? this.healthMetrics.totalResponseTime / this.healthMetrics.successfulRequests
      : 0;

    return {
      isHealthy: successRate >= 0.95 && this.circuitBreaker.getState() === CircuitState.CLOSED,
      successRate,
      averageResponseTime,
      totalRequests: this.healthMetrics.totalRequests,
      successfulRequests: this.healthMetrics.successfulRequests,
      failedRequests: this.healthMetrics.failedRequests,
      lastSuccessfulRequest: this.healthMetrics.lastSuccessfulRequest || undefined,
      lastFailedRequest: this.healthMetrics.lastFailedRequest || undefined,
      circuitBreakerOpen: this.circuitBreaker.getState() === CircuitState.OPEN,
    };
  }

  public getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  private async makeRequest<T>(
    method: string,
    url: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    
    try {
      // Wait for rate limiting
      await this.rateLimiter.waitForToken();

      // Execute through circuit breaker
      const axiosResponse = await this.circuitBreaker.execute(async () => {
        return await this.httpClient.request({
          method,
          url,
          data,
          params,
        });
      });

      const duration = Date.now() - startTime;
      
      // Update health metrics
      this.updateHealthMetrics(true, duration);
      
      // Record performance metrics
      this.recordPerformanceMetric(method, url, duration, true);

      // Update rate limiter from response headers
      this.rateLimiter.updateFromHeaders(axiosResponse.headers as Record<string, string>);

      return {
        data: axiosResponse.data,
        status: axiosResponse.status,
        headers: axiosResponse.headers as Record<string, string>,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update health metrics
      this.updateHealthMetrics(false, duration);
      
      // Record performance metrics
      this.recordPerformanceMetric(method, url, duration, false);

      // Convert to AgentError
      const agentError = this.convertToAgentError(error, method, url);
      throw agentError;
    }
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.httpClient.interceptors.request.use(
      (config) => {
        if (this.authService.isConfigured()) {
          const authConfig = this.authService.getConfiguration();
          const credentials = Buffer.from(`:${authConfig.personalAccessToken}`).toString('base64');
          config.headers['Authorization'] = `Basic ${credentials}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for retry logic
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (this.shouldRetry(error)) {
          return this.retryRequest(error);
        }
        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) {
      // Network error - should retry
      return true;
    }

    const status = error.response.status;
    
    // Retry on 5xx server errors, but not 4xx client errors
    return status >= 500 && status < 600;
  }

  private async retryRequest(error: AxiosError): Promise<AxiosResponse> {
    const config = error.config;
    if (!config) {
      throw error;
    }

    const maxRetries = this.configManager.getApiClientConfig().retryAttempts;
    const retryCount = (config as any).__retryCount || 0;

    if (retryCount >= maxRetries) {
      throw error;
    }

    // Exponential backoff
    const delay = Math.pow(2, retryCount) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    (config as any).__retryCount = retryCount + 1;
    return this.httpClient(config);
  }

  private convertToAgentError(error: any, method: string, url: string): AgentError {
    const context = {
      operation: `${method} ${url}`,
      timestamp: new Date(),
    };

    if (error.message === 'Circuit breaker is OPEN - rejecting request') {
      return {
        code: 'CIRCUIT_BREAKER_OPEN',
        message: 'Circuit breaker is open due to repeated failures',
        category: 'NETWORK',
        severity: 'HIGH',
        context,
        userMessage: 'Service is currently unavailable due to repeated failures',
        recoverable: true,
      };
    }

    if (error.response) {
      const status = error.response.status;
      
      if (status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        return {
          code: 'API_RATE_LIMITED',
          message: 'Rate limit exceeded',
          category: 'RATE_LIMIT',
          severity: 'MEDIUM',
          context: {
            ...context,
            statusCode: status,
            retryAfter: retryAfter ? parseInt(retryAfter, 10) : 60,
          },
          userMessage: ERROR_MESSAGES.NETWORK.RATE_LIMITED,
          recoverable: true,
        };
      }

      if (status === 404) {
        return {
          code: 'API_NOT_FOUND',
          message: 'Resource not found',
          category: 'API',
          severity: 'MEDIUM',
          context: { ...context, statusCode: status },
          userMessage: ERROR_MESSAGES.API.NOT_FOUND,
          recoverable: false,
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
        code: 'API_CLIENT_ERROR',
        message: `Client error: ${status}`,
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

  private updateHealthMetrics(success: boolean, duration: number): void {
    this.healthMetrics.totalRequests++;
    
    if (success) {
      this.healthMetrics.successfulRequests++;
      this.healthMetrics.totalResponseTime += duration;
      this.healthMetrics.lastSuccessfulRequest = new Date();
    } else {
      this.healthMetrics.failedRequests++;
      this.healthMetrics.lastFailedRequest = new Date();
    }
  }

  private recordPerformanceMetric(method: string, url: string, duration: number, success: boolean): void {
    const metric: PerformanceMetrics = {
      operation: `${method} ${url}`,
      duration,
      success,
      timestamp: new Date(),
    };

    this.performanceMetrics.push(metric);
    
    // Keep only last 100 metrics
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100);
    }
  }
}