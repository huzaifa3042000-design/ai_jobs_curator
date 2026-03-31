/**
 * Simple in-memory rate limiter for Upwork API (300 req/min per IP)
 */
class RateLimiter {
  constructor(maxRequests = 280, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canProceed() {
    const now = Date.now();
    this.requests = this.requests.filter((t) => now - t < this.windowMs);
    return this.requests.length < this.maxRequests;
  }

  record() {
    this.requests.push(Date.now());
  }

  async waitIfNeeded() {
    while (!this.canProceed()) {
      const oldest = this.requests[0];
      const waitTime = this.windowMs - (Date.now() - oldest) + 100;
      await new Promise((r) => setTimeout(r, waitTime));
      this.requests = this.requests.filter((t) => Date.now() - t < this.windowMs);
    }
    this.record();
  }
}

export const upworkLimiter = new RateLimiter(280, 60000);
