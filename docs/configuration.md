# Configuration Guide

Complete configuration guide for setting up and customizing the Azure DevOps AI Agent. This guide includes security best practices, environment-specific configurations, and validation steps.

## Table of Contents

- [Authentication Configuration](#authentication-configuration)
- [Environment Settings](#environment-settings)
- [API Client Configuration](#api-client-configuration)
- [Performance Tuning](#performance-tuning)
- [Security Configuration](#security-configuration)
- [Development vs Production](#development-vs-production)
- [Validation and Testing](#validation-and-testing)

## Authentication Configuration

### Personal Access Token (PAT) Setup

**Step 1: Create PAT in Azure DevOps**

1. Navigate to Azure DevOps → User Settings → Personal Access Tokens
2. Click "New Token"
3. Configure token settings:
   - **Name**: `Azure DevOps AI Agent - [Environment]`
   - **Organization**: Select your organization or "All accessible organizations"
   - **Expiration**: 90 days (recommended for security)
   - **Scopes**: Custom defined

**Required Scopes:**
```
Work Items: Read & Write
Project and Team: Read
Build: Read (for build integration)
Release: Read (for release tracking)
```

**Step 2: Secure PAT Storage**

**Environment Variables (Recommended):**
```bash
# .env file (never commit to git)
AZURE_DEVOPS_PAT=your-personal-access-token-here
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-organization
AZURE_DEVOPS_PROJECT=your-project-name

# Optional: For multi-project setups
AZURE_DEVOPS_DEFAULT_AREA_PATH=YourProject\\YourTeam
AZURE_DEVOPS_DEFAULT_ITERATION_PATH=YourProject\\Sprint1
```

**Key Management Service (Production):**
```typescript
// For production environments
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { DefaultAzureCredential } from '@azure/identity';

// Azure Key Vault example
const credential = new DefaultAzureCredential();
const vaultUrl = 'https://your-vault.vault.azure.net/';

async function getSecret(secretName: string): Promise<string> {
  const client = new SecretClient(vaultUrl, credential);
  const secret = await client.getSecret(secretName);
  return secret.value;
}
```

**Step 3: PAT Validation**

Create a validation script to verify PAT configuration:

```typescript
// scripts/validate-auth.ts
import { AuthService } from '../src/auth/AuthService';

async function validateAuthentication() {
  try {
    const authService = new AuthService({
      organization: process.env.AZURE_DEVOPS_ORG_URL,
      personalAccessToken: process.env.AZURE_DEVOPS_PAT,
      project: process.env.AZURE_DEVOPS_PROJECT
    });

    const validation = await authService.validateAuthentication();
    
    if (validation.valid) {
      console.log('✅ Authentication successful');
      console.log(`Organization: ${validation.organization}`);
      console.log(`Project: ${validation.project}`);
      console.log(`Permissions: ${validation.permissions.join(', ')}`);
    } else {
      console.error('❌ Authentication failed:', validation.error);
    }
  } catch (error) {
    console.error('❌ Validation error:', error.message);
  }
}

validateAuthentication();
```

## Environment Settings

### Base Configuration Structure

```typescript
// config/environment.ts
export interface EnvironmentConfig {
  authentication: {
    organizationUrl: string;
    project: string;
    patSource: 'env' | 'keyvault' | 'file';
    patKeyName?: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  performance: {
    rateLimits: {
      requests: number;
      windowMs: number;
    };
    caching: {
      enabled: boolean;
      ttl: number;
    };
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
    enableAuditTrail: boolean;
  };
}
```

### Environment-Specific Configurations

**Development Environment:**
```typescript
// config/development.ts
export const developmentConfig: EnvironmentConfig = {
  authentication: {
    organizationUrl: process.env.AZURE_DEVOPS_ORG_URL!,
    project: process.env.AZURE_DEVOPS_PROJECT!,
    patSource: 'env'
  },
  api: {
    baseUrl: 'https://dev.azure.com',
    timeout: 10000,
    retryAttempts: 2,
    retryDelay: 1000
  },
  performance: {
    rateLimits: {
      requests: 50,
      windowMs: 60000
    },
    caching: {
      enabled: true,
      ttl: 300000 // 5 minutes
    }
  },
  logging: {
    level: 'debug',
    enableMetrics: true,
    enableAuditTrail: true
  }
};
```

**Production Environment:**
```typescript
// config/production.ts
export const productionConfig: EnvironmentConfig = {
  authentication: {
    organizationUrl: process.env.AZURE_DEVOPS_ORG_URL!,
    project: process.env.AZURE_DEVOPS_PROJECT!,
    patSource: 'keyvault',
    patKeyName: 'azure-devops-pat'
  },
  api: {
    baseUrl: 'https://dev.azure.com',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 2000
  },
  performance: {
    rateLimits: {
      requests: 100,
      windowMs: 60000
    },
    caching: {
      enabled: true,
      ttl: 600000 // 10 minutes
    }
  },
  logging: {
    level: 'info',
    enableMetrics: true,
    enableAuditTrail: true
  }
};
```

## API Client Configuration

### HTTP Client Settings

```typescript
// config/api-client.ts
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  maxConcurrentRequests: number;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    recoveryTimeout: number;
  };
  headers: Record<string, string>;
}

const defaultApiConfig: ApiClientConfig = {
  baseUrl: 'https://dev.azure.com',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  maxConcurrentRequests: 10,
  rateLimit: {
    requests: 100,
    windowMs: 60000
  },
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    recoveryTimeout: 30000
  },
  headers: {
    'Content-Type': 'application/json-patch+json',
    'Accept': 'application/json',
    'User-Agent': 'Azure-DevOps-AI-Agent/1.0.0'
  }
};
```

### Request/Response Interceptors

```typescript
// config/interceptors.ts
export function setupInterceptors(client: AxiosInstance) {
  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add authentication
      if (process.env.AZURE_DEVOPS_PAT) {
        const token = Buffer.from(`:${process.env.AZURE_DEVOPS_PAT}`).toString('base64');
        config.headers.Authorization = `Basic ${token}`;
      }
      
      // Add request ID for tracking
      config.headers['X-Request-ID'] = generateRequestId();
      
      // Log request (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log(`→ ${config.method?.toUpperCase()} ${config.url}`);
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      // Log response time
      const requestId = response.config.headers['X-Request-ID'];
      const duration = Date.now() - response.config.metadata.startTime;
      
      recordMetric({
        operation: 'api_request',
        duration,
        success: true,
        metadata: {
          requestId,
          method: response.config.method,
          url: response.config.url,
          status: response.status
        }
      });
      
      return response;
    },
    (error) => {
      // Handle rate limiting
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        return handleRateLimit(error, retryAfter);
      }
      
      // Log error
      recordMetric({
        operation: 'api_request',
        duration: Date.now() - error.config?.metadata?.startTime || 0,
        success: false,
        metadata: {
          error: error.message,
          status: error.response?.status
        }
      });
      
      return Promise.reject(error);
    }
  );
}
```

## Performance Tuning

### Rate Limiting Configuration

```typescript
// config/rate-limiting.ts
export interface RateLimitConfig {
  // Global rate limits
  global: {
    requests: number;
    windowMs: number;
  };
  
  // Per-operation rate limits
  operations: {
    'workitem.create': { requests: number; windowMs: number };
    'workitem.update': { requests: number; windowMs: number };
    'workitem.query': { requests: number; windowMs: number };
  };
  
  // Burst allowance
  burst: {
    enabled: boolean;
    maxBurstSize: number;
    burstRefillRate: number;
  };
}

const rateLimitConfig: RateLimitConfig = {
  global: {
    requests: 100,
    windowMs: 60000 // 100 requests per minute
  },
  operations: {
    'workitem.create': { requests: 30, windowMs: 60000 },
    'workitem.update': { requests: 50, windowMs: 60000 },
    'workitem.query': { requests: 200, windowMs: 60000 }
  },
  burst: {
    enabled: true,
    maxBurstSize: 10,
    burstRefillRate: 2 // tokens per second
  }
};
```

### Caching Configuration

```typescript
// config/caching.ts
export interface CacheConfig {
  enabled: boolean;
  provider: 'memory' | 'redis' | 'file';
  ttl: number; // Time to live in milliseconds
  maxItems: number;
  strategies: {
    workItems: {
      ttl: number;
      refreshThreshold: number; // Refresh when TTL < threshold
    };
    queries: {
      ttl: number;
      keyGenerator: (query: any) => string;
    };
  };
}

const cacheConfig: CacheConfig = {
  enabled: true,
  provider: 'memory',
  ttl: 300000, // 5 minutes default
  maxItems: 1000,
  strategies: {
    workItems: {
      ttl: 600000, // 10 minutes for work items
      refreshThreshold: 60000 // Refresh if TTL < 1 minute
    },
    queries: {
      ttl: 180000, // 3 minutes for query results
      keyGenerator: (query) => `query:${JSON.stringify(query)}`
    }
  }
};
```

## Security Configuration

### PAT Security Best Practices

```typescript
// config/security.ts
export interface SecurityConfig {
  pat: {
    rotation: {
      enabled: boolean;
      intervalDays: number;
      warningDays: number;
    };
    validation: {
      onStartup: boolean;
      intervalMinutes: number;
    };
    storage: {
      encrypted: boolean;
      keyDerivation: 'pbkdf2' | 'scrypt' | 'argon2';
    };
  };
  
  logging: {
    sanitizeSecrets: boolean;
    auditLevel: 'none' | 'basic' | 'detailed';
    retentionDays: number;
  };
  
  network: {
    tlsVersion: string;
    certificateValidation: boolean;
    allowedDomains: string[];
  };
}

const securityConfig: SecurityConfig = {
  pat: {
    rotation: {
      enabled: true,
      intervalDays: 60,
      warningDays: 7
    },
    validation: {
      onStartup: true,
      intervalMinutes: 60
    },
    storage: {
      encrypted: true,
      keyDerivation: 'argon2'
    }
  },
  
  logging: {
    sanitizeSecrets: true,
    auditLevel: 'detailed',
    retentionDays: 90
  },
  
  network: {
    tlsVersion: 'TLSv1.3',
    certificateValidation: true,
    allowedDomains: ['dev.azure.com', '*.visualstudio.com']
  }
};
```

### Secret Management

```typescript
// utils/secret-manager.ts
export class SecretManager {
  private static instance: SecretManager;
  private secrets: Map<string, { value: string; expires: Date }> = new Map();
  
  public static getInstance(): SecretManager {
    if (!SecretManager.instance) {
      SecretManager.instance = new SecretManager();
    }
    return SecretManager.instance;
  }
  
  async getSecret(key: string): Promise<string> {
    const cached = this.secrets.get(key);
    
    if (cached && cached.expires > new Date()) {
      return cached.value;
    }
    
    const value = await this.fetchFromVault(key);
    this.secrets.set(key, {
      value,
      expires: new Date(Date.now() + 300000) // 5 minutes
    });
    
    return value;
  }
  
  private async fetchFromVault(key: string): Promise<string> {
    // Implementation depends on your secret store
    switch (process.env.SECRET_PROVIDER) {
      case 'azure-keyvault':
        return await this.fetchFromAzureKeyVault(key);
      case 'aws-secrets':
        return await this.fetchFromAWSSecrets(key);
      case 'env':
        return process.env[key] || '';
      default:
        throw new Error(`Unknown secret provider: ${process.env.SECRET_PROVIDER}`);
    }
  }
}
```

## Development vs Production

### Development Configuration

```typescript
// config/development.ts
export const developmentConfig = {
  // Relaxed security for development
  authentication: {
    patSource: 'env',
    validateOnStartup: false
  },
  
  // Verbose logging
  logging: {
    level: 'debug',
    enableConsole: true,
    enableFile: false,
    sanitizeSecrets: false // For debugging
  },
  
  // Lenient rate limits
  performance: {
    rateLimits: {
      requests: 1000,
      windowMs: 60000
    }
  },
  
  // Fast timeouts for quick feedback
  api: {
    timeout: 5000,
    retryAttempts: 1
  }
};
```

### Production Configuration

```typescript
// config/production.ts
export const productionConfig = {
  // Strict security
  authentication: {
    patSource: 'keyvault',
    validateOnStartup: true,
    rotationEnabled: true
  },
  
  // Structured logging
  logging: {
    level: 'info',
    enableConsole: false,
    enableFile: true,
    sanitizeSecrets: true,
    format: 'json'
  },
  
  // Conservative rate limits
  performance: {
    rateLimits: {
      requests: 100,
      windowMs: 60000
    }
  },
  
  // Robust timeouts and retries
  api: {
    timeout: 30000,
    retryAttempts: 3,
    circuitBreakerEnabled: true
  }
};
```

## Validation and Testing

### Configuration Validation

```typescript
// scripts/validate-config.ts
import Joi from 'joi';

const configSchema = Joi.object({
  authentication: Joi.object({
    organizationUrl: Joi.string().uri().required(),
    project: Joi.string().required(),
    patSource: Joi.string().valid('env', 'keyvault', 'file').required()
  }).required(),
  
  api: Joi.object({
    timeout: Joi.number().min(1000).max(60000),
    retryAttempts: Joi.number().min(0).max(5)
  }),
  
  performance: Joi.object({
    rateLimits: Joi.object({
      requests: Joi.number().min(1).max(1000),
      windowMs: Joi.number().min(1000)
    })
  })
});

export function validateConfiguration(config: any): { valid: boolean; errors?: string[] } {
  const { error } = configSchema.validate(config, { abortEarly: false });
  
  if (error) {
    return {
      valid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return { valid: true };
}
```

### End-to-End Configuration Test

```bash
#!/bin/bash
# scripts/test-config.sh

echo "🔧 Testing Azure DevOps AI Agent Configuration..."

# Test authentication
echo "1. Testing authentication..."
npm run test:auth
if [ $? -ne 0 ]; then
  echo "❌ Authentication test failed"
  exit 1
fi

# Test API connectivity
echo "2. Testing API connectivity..."
npm run test:api
if [ $? -ne 0 ]; then
  echo "❌ API connectivity test failed"
  exit 1
fi

# Test work item operations
echo "3. Testing work item operations..."
npm run test:workitems
if [ $? -ne 0 ]; then
  echo "❌ Work item operations test failed"
  exit 1
fi

# Test performance benchmarks
echo "4. Testing performance benchmarks..."
npm run test:performance
if [ $? -ne 0 ]; then
  echo "❌ Performance benchmark test failed"
  exit 1
fi

echo "✅ All configuration tests passed!"
```

### Performance Validation

```typescript
// tests/performance-validation.ts
describe('Performance Validation', () => {
  test('Work item creation should complete within 3 seconds', async () => {
    const startTime = Date.now();
    
    const result = await workItemService.createWorkItem({
      workItemType: 'Task',
      fields: {
        'System.Title': 'Performance test item'
      }
    });
    
    const duration = Date.now() - startTime;
    
    expect(result.success).toBe(true);
    expect(duration).toBeLessThan(3000);
  });
  
  test('Bulk operations should handle 50 items efficiently', async () => {
    const startTime = Date.now();
    const ids = Array.from({ length: 50 }, (_, i) => i + 1);
    
    const result = await workItemService.getWorkItems(ids);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(5000);
    expect(result.workItems?.length).toBeLessThanOrEqual(50);
  });
});
```

## Configuration Examples

### Multi-Environment Setup

```typescript
// config/index.ts
import { developmentConfig } from './development';
import { productionConfig } from './production';
import { testConfig } from './test';

const configs = {
  development: developmentConfig,
  production: productionConfig,
  test: testConfig
};

export function getConfig() {
  const env = process.env.NODE_ENV || 'development';
  const config = configs[env];
  
  if (!config) {
    throw new Error(`No configuration found for environment: ${env}`);
  }
  
  // Validate configuration
  const validation = validateConfiguration(config);
  if (!validation.valid) {
    throw new Error(`Invalid configuration: ${validation.errors?.join(', ')}`);
  }
  
  return config;
}
```

### Dynamic Configuration

```typescript
// config/dynamic-config.ts
export class DynamicConfig {
  private config: any;
  private lastUpdated: Date;
  private updateInterval = 300000; // 5 minutes
  
  constructor(private configSource: string) {
    this.loadConfig();
    this.startPeriodicUpdates();
  }
  
  async loadConfig(): Promise<void> {
    try {
      const response = await fetch(this.configSource);
      this.config = await response.json();
      this.lastUpdated = new Date();
      
      console.log('Configuration updated successfully');
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  }
  
  private startPeriodicUpdates(): void {
    setInterval(() => {
      this.loadConfig();
    }, this.updateInterval);
  }
  
  get(key: string): any {
    return this.config[key];
  }
}
```

---

**Configuration Version**: 1.0.0  
**Last Updated**: 2025-08-15  
**Compatibility**: Azure DevOps API v7.0+