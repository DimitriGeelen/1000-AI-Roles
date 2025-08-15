// Authentication Service for Azure DevOps Agent

import { AuthConfig, AgentError, PerformanceMetrics } from '../types';
import { ConfigurationManager } from '../config/ConfigurationManager';
import { ERROR_MESSAGES } from '../config/default';

export interface AuthResult {
  success: boolean;
  message?: string;
  error?: AgentError;
}

export interface AuthValidation {
  valid: boolean;
  responseTime: number;
  permissions?: string[];
  error?: AgentError;
}

export class AuthService {
  private config: AuthConfig | null = null;
  private configured = false;
  private configManager: ConfigurationManager;
  private performanceMetrics: PerformanceMetrics[] = [];

  constructor(configManager?: ConfigurationManager) {
    this.configManager = configManager || ConfigurationManager.getInstance();
  }

  public async configure(authConfig: AuthConfig): Promise<AuthResult> {
    const startTime = Date.now();
    
    try {
      // Validate configuration
      const validation = this.configManager.validateAuthConfig(authConfig);
      if (!validation.valid) {
        const error: AgentError = {
          code: 'AUTH_INVALID_CONFIG',
          message: validation.errors.join(', '),
          category: 'AUTH',
          severity: 'HIGH',
          context: {
            operation: 'configure',
            timestamp: new Date(),
          },
          userMessage: ERROR_MESSAGES.AUTH.INVALID_PAT,
          recoverable: true,
        };

        this.recordMetrics('configure', startTime, false);
        return { success: false, error };
      }

      // Store configuration securely
      this.config = { ...authConfig };
      this.configured = true;

      this.recordMetrics('configure', startTime, true);
      return {
        success: true,
        message: `Authentication configured successfully for organization: ${authConfig.organization}`,
      };
    } catch (error) {
      this.recordMetrics('configure', startTime, false);
      
      const agentError: AgentError = {
        code: 'AUTH_CONFIG_ERROR',
        message: error instanceof Error ? error.message : 'Unknown configuration error',
        category: 'AUTH',
        severity: 'HIGH',
        context: {
          operation: 'configure',
          timestamp: new Date(),
        },
        userMessage: 'Failed to configure authentication',
        recoverable: true,
      };

      return { success: false, error: agentError };
    }
  }

  public isConfigured(): boolean {
    return this.configured && this.config !== null;
  }

  public getConfiguration(): AuthConfig {
    if (!this.config) {
      throw new Error('Authentication not configured');
    }

    // Return masked configuration for security
    return this.configManager.maskSensitiveData(this.config) as AuthConfig;
  }

  public async validateAuthentication(): Promise<AuthValidation> {
    const startTime = Date.now();

    if (!this.isConfigured() || !this.config) {
      const error: AgentError = {
        code: 'AUTH_NOT_CONFIGURED',
        message: 'Authentication not configured',
        category: 'AUTH',
        severity: 'HIGH',
        context: {
          operation: 'validate',
          timestamp: new Date(),
        },
        userMessage: 'Please configure authentication first',
        recoverable: true,
      };

      return {
        valid: false,
        responseTime: Date.now() - startTime,
        error,
      };
    }

    try {
      // Simulate Azure DevOps API validation call
      // In real implementation, this would make an HTTP request
      const isValidPat = await this.simulatePatValidation(this.config.personalAccessToken);
      const responseTime = Date.now() - startTime;

      if (isValidPat) {
        this.recordMetrics('validate', startTime, true);
        return {
          valid: true,
          responseTime,
          permissions: ['read', 'write', 'manage'], // Mock permissions
        };
      } else {
        const error: AgentError = {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid credentials provided',
          category: 'AUTH',
          severity: 'HIGH',
          context: {
            operation: 'validate',
            timestamp: new Date(),
          },
          userMessage: ERROR_MESSAGES.AUTH.UNAUTHORIZED,
          recoverable: true,
        };

        this.recordMetrics('validate', startTime, false);
        return {
          valid: false,
          responseTime,
          error,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordMetrics('validate', startTime, false);

      const agentError: AgentError = {
        code: 'AUTH_VALIDATION_ERROR',
        message: error instanceof Error ? error.message : 'Validation failed',
        category: 'NETWORK',
        severity: 'MEDIUM',
        context: {
          operation: 'validate',
          timestamp: new Date(),
        },
        userMessage: ERROR_MESSAGES.NETWORK.CONNECTION_FAILED,
        recoverable: true,
      };

      return {
        valid: false,
        responseTime,
        error: agentError,
      };
    }
  }

  public getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  private async simulatePatValidation(pat: string): Promise<boolean> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    // Simple validation simulation - in real implementation this would be an HTTP request
    return pat.length > 10 && pat !== 'invalid-pat-token';
  }

  private recordMetrics(operation: string, startTime: number, success: boolean, metadata?: Record<string, any>): void {
    const metric: PerformanceMetrics = {
      operation: `auth.${operation}`,
      duration: Date.now() - startTime,
      success,
      timestamp: new Date(),
      metadata,
    };

    this.performanceMetrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100);
    }
  }

  public reset(): void {
    this.config = null;
    this.configured = false;
    this.performanceMetrics = [];
  }
}