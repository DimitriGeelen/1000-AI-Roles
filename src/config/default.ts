// Default configuration for Azure DevOps Agent

import { ApiClientConfig } from '../types';

export const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: 'https://dev.azure.com',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second base delay
  rateLimit: {
    requests: 100, // requests per window
    windowMs: 60000, // 1 minute window
  },
};

export const PERFORMANCE_TARGETS = {
  MAX_RESPONSE_TIME: 5000, // 5 seconds
  TARGET_RELIABILITY: 0.995, // 99.5%
  MAX_ERROR_RATE: 0.005, // 0.5%
};

export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_PAT: 'Personal Access Token is invalid or expired',
    MISSING_ORG: 'Organization name is required',
    UNAUTHORIZED: 'Authentication failed - check your credentials',
  },
  NETWORK: {
    CONNECTION_FAILED: 'Unable to connect to Azure DevOps',
    TIMEOUT: 'Request timed out - please try again',
    RATE_LIMITED: 'Too many requests - please wait before retrying',
  },
  VALIDATION: {
    INVALID_WORK_ITEM_TYPE: 'Invalid work item type specified',
    MISSING_REQUIRED_FIELD: 'Required field is missing',
    INVALID_FIELD_VALUE: 'Field value is not valid',
  },
  API: {
    NOT_FOUND: 'Work item not found',
    SERVER_ERROR: 'Azure DevOps service is currently unavailable',
    BAD_REQUEST: 'Invalid request - check your parameters',
  },
};