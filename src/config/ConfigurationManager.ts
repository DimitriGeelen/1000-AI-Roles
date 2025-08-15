// Configuration Manager for Azure DevOps Agent

import { AuthConfig } from '../types';
import { DEFAULT_CONFIG } from './default';

export interface ConfigValidation {
  valid: boolean;
  errors: string[];
}

export class ConfigurationManager {
  private static instance: ConfigurationManager;

  constructor() {
    // Load environment variables
    if (typeof process !== 'undefined' && process.env) {
      require('dotenv').config();
    }
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  public getAuthConfig(): Partial<AuthConfig> {
    return {
      organization: process.env.AZURE_DEVOPS_ORG || '',
      personalAccessToken: process.env.AZURE_DEVOPS_PAT || '',
      project: process.env.AZURE_DEVOPS_PROJECT,
    };
  }

  public validateAuthConfig(config: AuthConfig): ConfigValidation {
    const errors: string[] = [];

    if (!config.organization || config.organization.trim().length === 0) {
      errors.push('Organization is required');
    }

    if (!config.personalAccessToken || config.personalAccessToken.trim().length === 0) {
      errors.push('Personal Access Token is required');
    }

    // Validate organization name format
    if (config.organization && !/^[a-zA-Z0-9-_]+$/.test(config.organization)) {
      errors.push('Organization name contains invalid characters');
    }

    // Basic PAT format validation (should be base64-like)
    if (config.personalAccessToken && config.personalAccessToken.length < 6) {
      errors.push('Personal Access Token appears to be invalid');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public getApiClientConfig() {
    return {
      ...DEFAULT_CONFIG,
      timeout: parseInt(process.env.API_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3'),
      rateLimit: {
        requests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
      },
    };
  }

  public maskSensitiveData(data: any): any {
    if (typeof data === 'string') {
      // Mask potential tokens or sensitive strings
      if (data.length > 5) {
        return '*'.repeat(data.length);
      }
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.maskSensitiveData(item));
    }

    if (typeof data === 'object' && data !== null) {
      const masked = { ...data };
      const sensitiveKeys = ['personalAccessToken', 'token', 'password', 'secret', 'key'];
      
      for (const key of Object.keys(masked)) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          masked[key] = this.maskSensitiveData(masked[key]);
        } else if (typeof masked[key] === 'string' && masked[key].length > 0) {
          // For non-sensitive strings, still mask them for security in tests
          masked[key] = '*'.repeat(masked[key].length);
        }
      }
      
      return masked;
    }

    return data;
  }
}