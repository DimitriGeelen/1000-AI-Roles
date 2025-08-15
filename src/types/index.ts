// Core type definitions for Azure DevOps Agent

export interface AuthConfig {
  organization: string;
  personalAccessToken: string;
  project?: string;
}

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
}

export interface WorkItem {
  id?: number;
  fields: Record<string, any>;
  relations?: WorkItemRelation[];
}

export interface WorkItemRelation {
  rel: string;
  url: string;
  attributes?: Record<string, any>;
}

export interface CreateWorkItemRequest {
  workItemType: string;
  fields: Record<string, any>;
  relations?: WorkItemRelation[];
}

export interface UpdateWorkItemRequest {
  id: number;
  operations: WorkItemOperation[];
}

export interface WorkItemOperation {
  op: 'add' | 'replace' | 'remove';
  path: string;
  value?: any;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  duration: number;
}

export interface ErrorContext {
  operation: string;
  workItemId?: number;
  statusCode?: number;
  retryCount?: number;
  retryAfter?: number;
  timestamp: Date;
}

export interface AgentError {
  code: string;
  message: string;
  category: 'AUTH' | 'NETWORK' | 'VALIDATION' | 'API' | 'RATE_LIMIT' | 'UNKNOWN';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  context: ErrorContext;
  userMessage: string;
  recoverable: boolean;
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: Date;
  limit: number;
}

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  timestamp: Date;
  metadata?: Record<string, any>;
}