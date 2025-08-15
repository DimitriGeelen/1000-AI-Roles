// Error Recovery with retry logic, circuit breaker, and fallback mechanisms

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBase: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  attemptCount: number;
  totalDuration: number;
  error?: Error;
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

export interface CircuitBreakerState {
  state: 'OPEN' | 'CLOSED' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime?: number;
  nextAttemptTime?: number;
}

export interface FallbackOptions {
  timeout: number;
}

export interface FallbackResult<T> {
  success: boolean;
  data?: T;
  usedFallback: boolean;
  error?: Error;
}

export interface RecoveryMetrics {
  totalRetryAttempts: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  averageRetryCount: number;
  circuitBreakerStates: Record<string, CircuitBreakerState>;
}

export class CircuitBreaker {
  private state: 'OPEN' | 'CLOSED' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime?: number;
  private nextAttemptTime?: number;
  private options: CircuitBreakerOptions;

  constructor(options: CircuitBreakerOptions) {
    this.options = options;
  }

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < (this.nextAttemptTime || 0)) {
        throw new Error('Circuit breaker is OPEN - rejecting request');
      }
      // Try to close the circuit
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  public recordFailure(): void {
    this.onFailure();
  }

  public getState(): 'OPEN' | 'CLOSED' | 'HALF_OPEN' {
    return this.state;
  }

  public getFailureCount(): number {
    return this.failureCount;
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      // Successfully recovered, close the circuit
      this.state = 'CLOSED';
    }
    this.failureCount = 0;
    this.lastFailureTime = undefined;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      // Failed during recovery attempt, open circuit again
      this.openCircuit();
    } else if (this.failureCount >= this.options.failureThreshold) {
      // Too many failures, open the circuit
      this.openCircuit();
    }
  }

  private openCircuit(): void {
    this.state = 'OPEN';
    this.nextAttemptTime = Date.now() + this.options.resetTimeout;
  }
}

export class ErrorRecovery {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private retryMetrics = {
    totalRetryAttempts: 0,
    successfulRecoveries: 0,
    failedRecoveries: 0,
    totalRetryCount: 0,
  };

  public async retryOperation<T>(
    operation: () => Promise<T>,
    options: RetryOptions
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    let lastError: Error;
    
    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
      this.retryMetrics.totalRetryAttempts++;
      
      try {
        const result = await operation();
        const duration = Date.now() - startTime;
        
        if (attempt > 1) {
          this.retryMetrics.successfulRecoveries++;
          this.retryMetrics.totalRetryCount += attempt - 1;
        }
        
        return {
          success: true,
          data: result,
          attemptCount: attempt,
          totalDuration: duration,
        };
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on the last attempt
        if (attempt === options.maxAttempts) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          options.baseDelay * Math.pow(options.exponentialBase, attempt - 1),
          options.maxDelay
        );
        
        await this.sleep(delay);
      }
    }
    
    // All attempts failed
    this.retryMetrics.failedRecoveries++;
    this.retryMetrics.totalRetryCount += options.maxAttempts;
    
    return {
      success: false,
      attemptCount: options.maxAttempts,
      totalDuration: Date.now() - startTime,
      error: lastError!,
    };
  }

  public createCircuitBreaker(
    serviceName: string, 
    options: CircuitBreakerOptions
  ): CircuitBreaker {
    const circuitBreaker = new CircuitBreaker(options);
    this.circuitBreakers.set(serviceName, circuitBreaker);
    return circuitBreaker;
  }

  public getCircuitBreaker(serviceName: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(serviceName);
  }

  public async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    options: FallbackOptions
  ): Promise<FallbackResult<T>> {
    try {
      // Try primary operation with timeout
      const result = await Promise.race([
        primaryOperation(),
        this.timeout<T>(options.timeout)
      ]);
      
      return {
        success: true,
        data: result as T,
        usedFallback: false,
      };
    } catch (error) {
      // Primary failed, try fallback
      try {
        const fallbackResult = await fallbackOperation();
        return {
          success: true,
          data: fallbackResult,
          usedFallback: true,
        };
      } catch (fallbackError) {
        return {
          success: false,
          usedFallback: true,
          error: fallbackError as Error,
        };
      }
    }
  }

  public getRecoveryState(): any {
    const circuitBreakerStates: Record<string, CircuitBreakerState> = {};
    
    this.circuitBreakers.forEach((cb, name) => {
      circuitBreakerStates[name] = {
        state: cb.getState(),
        failureCount: cb.getFailureCount(),
        lastFailureTime: (cb as any).lastFailureTime,
        nextAttemptTime: (cb as any).nextAttemptTime,
      };
    });

    return {
      circuitBreakerStates,
      retryMetrics: { ...this.retryMetrics },
    };
  }

  public restoreRecoveryState(state: any): void {
    if (state.circuitBreakerStates) {
      Object.entries(state.circuitBreakerStates).forEach(([name, cbState]: [string, any]) => {
        const cb = new CircuitBreaker({
          failureThreshold: 5, // Default values, should be configurable
          resetTimeout: 60000,
          monitoringPeriod: 300000,
        });
        
        // Restore state
        (cb as any).state = cbState.state;
        (cb as any).failureCount = cbState.failureCount;
        (cb as any).lastFailureTime = cbState.lastFailureTime;
        (cb as any).nextAttemptTime = cbState.nextAttemptTime;
        
        this.circuitBreakers.set(name, cb);
      });
    }

    if (state.retryMetrics) {
      this.retryMetrics = { ...state.retryMetrics };
    }
  }

  public getRecoveryMetrics(): RecoveryMetrics {
    const circuitBreakerStates: Record<string, CircuitBreakerState> = {};
    
    this.circuitBreakers.forEach((cb, name) => {
      circuitBreakerStates[name] = {
        state: cb.getState(),
        failureCount: cb.getFailureCount(),
        lastFailureTime: (cb as any).lastFailureTime,
        nextAttemptTime: (cb as any).nextAttemptTime,
      };
    });

    const averageRetryCount = this.retryMetrics.totalRetryAttempts > 0
      ? this.retryMetrics.totalRetryCount / this.retryMetrics.totalRetryAttempts
      : 0;

    return {
      totalRetryAttempts: this.retryMetrics.totalRetryAttempts,
      successfulRecoveries: this.retryMetrics.successfulRecoveries,
      failedRecoveries: this.retryMetrics.failedRecoveries,
      averageRetryCount,
      circuitBreakerStates,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private timeout<T>(ms: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), ms);
    });
  }
}