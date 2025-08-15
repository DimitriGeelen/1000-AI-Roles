// Jest setup file for Azure DevOps Agent tests

// Mock axios for testing
jest.mock('axios');

// Setup test environment
beforeEach(() => {
  // Clear all environment variables before each test
  delete process.env.AZURE_DEVOPS_ORG;
  delete process.env.AZURE_DEVOPS_PAT;
  delete process.env.AZURE_DEVOPS_PROJECT;
  delete process.env.API_TIMEOUT;
  delete process.env.RETRY_ATTEMPTS;
  delete process.env.RATE_LIMIT_REQUESTS;
  delete process.env.RATE_LIMIT_WINDOW;

  // Reset all mocks
  jest.clearAllMocks();
});

// Global test utilities
(global as any).mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Console spy utilities for security testing
(global as any).mockConsole = () => {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  const logs: string[] = [];
  
  console.log = jest.fn((...args) => {
    logs.push(args.join(' '));
  });
  
  console.error = jest.fn((...args) => {
    logs.push(args.join(' '));
  });
  
  console.warn = jest.fn((...args) => {
    logs.push(args.join(' '));
  });

  return {
    getLogs: () => logs,
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }
  };
};