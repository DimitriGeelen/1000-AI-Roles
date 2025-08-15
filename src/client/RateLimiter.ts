// Token Bucket Rate Limiter for API Client

export interface RateLimitConfig {
  requests: number; // requests per window
  windowMs: number; // window size in milliseconds
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: Date;
  limit: number;
}

export class TokenBucketRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.tokens = config.requests;
    this.lastRefill = Date.now();
  }

  public async waitForToken(): Promise<void> {
    this.refillTokens();
    
    if (this.tokens >= 1) {
      this.tokens--;
      return Promise.resolve();
    }

    // Need to wait for tokens to be available
    const waitTime = Math.max(10, this.config.windowMs / this.config.requests);
    return new Promise(resolve => {
      setTimeout(() => {
        this.refillTokens();
        if (this.tokens >= 1) {
          this.tokens--;
        }
        resolve();
      }, waitTime);
    });
  }

  public getRateLimitInfo(): RateLimitInfo {
    this.refillTokens();
    
    return {
      remaining: Math.floor(this.tokens),
      resetTime: new Date(this.lastRefill + this.config.windowMs),
      limit: this.config.requests,
    };
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    
    if (timePassed >= this.config.windowMs) {
      // Full refill
      this.tokens = this.config.requests;
      this.lastRefill = now;
    } else {
      // Partial refill based on time passed
      const tokensToAdd = (this.config.requests * timePassed) / this.config.windowMs;
      this.tokens = Math.min(this.config.requests, this.tokens + tokensToAdd);
    }
  }

  private getTimeUntilRefill(): number {
    const now = Date.now();
    const nextRefill = this.lastRefill + this.config.windowMs;
    return Math.max(0, nextRefill - now);
  }

  public updateFromHeaders(headers: Record<string, string>): void {
    // Update rate limit info from API response headers
    const remaining = headers['x-ratelimit-remaining'];
    const reset = headers['x-ratelimit-reset'];
    const limit = headers['x-ratelimit-limit'];

    if (remaining) {
      this.tokens = parseInt(remaining, 10);
    }

    if (reset) {
      this.lastRefill = parseInt(reset, 10) - this.config.windowMs;
    }

    if (limit) {
      this.config.requests = parseInt(limit, 10);
    }
  }
}