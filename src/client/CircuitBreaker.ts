// Circuit Breaker pattern implementation for API reliability

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  resetTimeout: number; // Time to wait before trying to close
  monitoringPeriod: number; // Time window for failure counting
}

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private nextAttemptTime: number = 0;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('Circuit breaker is OPEN - rejecting request');
      }
      
      // Try to close the circuit
      this.state = CircuitState.HALF_OPEN;
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

  public getState(): CircuitState {
    return this.state;
  }

  public getMetrics() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime) : null,
      nextAttemptTime: this.nextAttemptTime ? new Date(this.nextAttemptTime) : null,
    };
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      // Successfully recovered, close the circuit
      this.state = CircuitState.CLOSED;
    }
    
    this.failures = 0;
    this.lastFailureTime = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Failed during recovery attempt, open circuit again
      this.openCircuit();
    } else if (this.failures >= this.config.failureThreshold) {
      // Too many failures, open the circuit
      this.openCircuit();
    }
  }

  private openCircuit(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.config.resetTimeout;
  }

  public reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.lastFailureTime = 0;
    this.nextAttemptTime = 0;
  }
}