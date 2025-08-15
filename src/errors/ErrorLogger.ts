// Error Logger with security and analytics capabilities

import { AgentError } from '../types';

export interface ErrorStatistics {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  mostCommonError: string;
  lastError?: Date;
}

export class ErrorLogger {
  private errorCounts: Map<string, number> = new Map();
  private categoryCounts: Map<string, number> = new Map();
  private severityCounts: Map<string, number> = new Map();
  private totalErrorCount = 0;
  private lastErrorTime?: Date;

  public logError(error: AgentError): void {
    // Sanitize error message before logging
    const sanitizedError = this.sanitizeError(error);
    
    // Log to console with structured format
    const logEntry = {
      timestamp: new Date().toISOString(),
      code: sanitizedError.code,
      category: sanitizedError.category,
      severity: sanitizedError.severity,
      operation: sanitizedError.context.operation,
      workItemId: sanitizedError.context.workItemId,
      statusCode: sanitizedError.context.statusCode,
      retryCount: sanitizedError.context.retryCount,
      recoverable: sanitizedError.recoverable,
      message: sanitizedError.message,
    };

    console.error(`[ERROR] ${JSON.stringify(logEntry, null, 2)}`);

    // Update statistics
    this.updateStatistics(error);
  }

  public getErrorStatistics(): ErrorStatistics {
    const errorsByCategory: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    this.categoryCounts.forEach((count, category) => {
      errorsByCategory[category] = count;
    });

    this.severityCounts.forEach((count, severity) => {
      errorsBySeverity[severity] = count;
    });

    // Find most common error
    let mostCommonError = '';
    let maxCount = 0;
    this.errorCounts.forEach((count, code) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonError = code;
      }
    });

    return {
      totalErrors: this.totalErrorCount,
      errorsByCategory,
      errorsBySeverity,
      mostCommonError,
      lastError: this.lastErrorTime,
    };
  }

  public clearStatistics(): void {
    this.errorCounts.clear();
    this.categoryCounts.clear();
    this.severityCounts.clear();
    this.totalErrorCount = 0;
    this.lastErrorTime = undefined;
  }

  private sanitizeError(error: AgentError): AgentError {
    // Create a copy to avoid modifying original
    const sanitized = { ...error };
    
    // Sanitize message to remove sensitive information
    sanitized.message = this.sanitizeMessage(error.message);
    
    return sanitized;
  }

  private sanitizeMessage(message: string): string {
    let sanitized = message;
    
    // Remove potential tokens, passwords, and other sensitive data
    const sensitivePatterns = [
      // Tokens and secrets
      /\b[a-zA-Z0-9]{20,}\b/g, // Long alphanumeric strings (potential tokens)
      /token[:\s]*[a-zA-Z0-9]+/gi,
      /password[:\s]*[^\s]+/gi,
      /secret[:\s]*[^\s]+/gi,
      /key[:\s]*[^\s]+/gi,
      
      // IP addresses and URLs with sensitive info
      /https?:\/\/[^\s]*:[^\s]*@[^\s]*/g,
      
      // Email addresses (might contain sensitive info)
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    ];

    sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, (match) => {
        // Replace with asterisks of similar length
        if (match.length > 10) {
          return '*'.repeat(Math.min(match.length, 20));
        }
        return '***';
      });
    });

    return sanitized;
  }

  private updateStatistics(error: AgentError): void {
    this.totalErrorCount++;
    this.lastErrorTime = new Date();

    // Update error code counts
    const currentCount = this.errorCounts.get(error.code) || 0;
    this.errorCounts.set(error.code, currentCount + 1);

    // Update category counts
    const categoryCount = this.categoryCounts.get(error.category) || 0;
    this.categoryCounts.set(error.category, categoryCount + 1);

    // Update severity counts
    const severityCount = this.severityCounts.get(error.severity) || 0;
    this.severityCounts.set(error.severity, severityCount + 1);
  }
}