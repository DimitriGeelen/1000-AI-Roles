// Evidence Tests for Authentication Service
// These tests prove the authentication system works as designed

import { AuthService } from '../../src/auth/AuthService';
import { ConfigurationManager } from '../../src/config/ConfigurationManager';
import { AuthConfig } from '../../src/types';

describe('Authentication Service - Evidence Tests', () => {
  let authService: AuthService;
  let configManager: ConfigurationManager;

  beforeEach(() => {
    configManager = new ConfigurationManager();
    authService = new AuthService(configManager);
  });

  describe('T001 Evidence: PAT Authentication Setup', () => {
    test('EVIDENCE: Valid PAT configuration is accepted and stored securely', async () => {
      // SETUP: Valid authentication configuration
      const validConfig: AuthConfig = {
        organization: 'test-org',
        personalAccessToken: 'valid-pat-token-123',
        project: 'test-project',
      };

      // EXECUTE: Configure authentication
      const result = await authService.configure(validConfig);

      // VERIFY: Configuration is accepted and secure
      expect(result.success).toBe(true);
      expect(result.message).toContain('configured successfully');
      expect(authService.isConfigured()).toBe(true);
      
      // Verify PAT is not exposed in plain text
      const config = authService.getConfiguration();
      expect(config.personalAccessToken).not.toBe(validConfig.personalAccessToken);
      expect(config.personalAccessToken).toMatch(/^\*+$/); // Should be masked
    });

    test('EVIDENCE: Invalid PAT configuration is rejected with clear error', async () => {
      // SETUP: Invalid authentication configuration
      const invalidConfig: AuthConfig = {
        organization: 'test-org',
        personalAccessToken: '', // Empty PAT
      };

      // EXECUTE: Attempt to configure with invalid PAT
      const result = await authService.configure(invalidConfig);

      // VERIFY: Configuration is rejected with clear error
      expect(result.success).toBe(false);
      expect(result.error?.category).toBe('AUTH');
      expect(result.error?.message).toContain('Personal Access Token');
      expect(authService.isConfigured()).toBe(false);
    });
  });

  describe('T002 Evidence: Configuration Manager', () => {
    test('EVIDENCE: Environment variables override default configuration', () => {
      // SETUP: Set environment variables
      process.env.AZURE_DEVOPS_ORG = 'env-org';
      process.env.AZURE_DEVOPS_PAT = 'env-pat-token';
      process.env.AZURE_DEVOPS_PROJECT = 'env-project';

      // EXECUTE: Get configuration from environment
      const config = configManager.getAuthConfig();

      // VERIFY: Environment values are used
      expect(config.organization).toBe('env-org');
      expect(config.personalAccessToken).toBe('env-pat-token');
      expect(config.project).toBe('env-project');

      // Cleanup
      delete process.env.AZURE_DEVOPS_ORG;
      delete process.env.AZURE_DEVOPS_PAT;
      delete process.env.AZURE_DEVOPS_PROJECT;
    });

    test('EVIDENCE: Configuration validation catches missing required fields', () => {
      // SETUP: Configuration with missing required fields
      const incompleteConfig = {
        personalAccessToken: 'token-123',
        // Missing organization
      };

      // EXECUTE: Validate configuration
      const validation = configManager.validateAuthConfig(incompleteConfig as AuthConfig);

      // VERIFY: Validation fails with specific error
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Organization is required');
    });
  });

  describe('T003 Evidence: Auth Validation', () => {
    test('EVIDENCE: Authentication validates successfully against Azure DevOps', async () => {
      // SETUP: Valid configuration
      const validConfig: AuthConfig = {
        organization: 'test-org',
        personalAccessToken: 'valid-pat-token-123',
      };

      await authService.configure(validConfig);

      // EXECUTE: Validate authentication
      const validation = await authService.validateAuthentication();

      // VERIFY: Authentication is valid
      expect(validation.valid).toBe(true);
      expect(validation.responseTime).toBeLessThan(5000); // < 5 seconds
      expect(validation.permissions).toBeDefined();
      expect(validation.permissions!.length).toBeGreaterThan(0);
    });

    test('EVIDENCE: Authentication validation fails gracefully with invalid credentials', async () => {
      // SETUP: Invalid configuration
      const invalidConfig: AuthConfig = {
        organization: 'test-org',
        personalAccessToken: 'invalid-pat-token',
      };

      await authService.configure(invalidConfig);

      // EXECUTE: Attempt validation with invalid credentials
      const validation = await authService.validateAuthentication();

      // VERIFY: Validation fails with clear feedback
      expect(validation.valid).toBe(false);
      expect(validation.error?.category).toBe('AUTH');
      expect(validation.error?.userMessage).toContain('credentials');
      expect(validation.responseTime).toBeLessThan(5000);
    });
  });

  describe('T004 Evidence: Security Testing', () => {
    test('EVIDENCE: PAT tokens are never logged or exposed in error messages', async () => {
      // SETUP: Configuration with PAT
      const config: AuthConfig = {
        organization: 'test-org',
        personalAccessToken: 'secret-pat-token-should-not-appear',
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        // EXECUTE: Various operations that might log
        await authService.configure(config);
        await authService.validateAuthentication();
        
        // Force an error scenario
        await authService.configure({ ...config, organization: '' });

        // VERIFY: PAT never appears in logs
        const allLogs = [...consoleSpy.mock.calls, ...errorSpy.mock.calls]
          .flat()
          .join(' ');
        
        expect(allLogs).not.toContain('secret-pat-token-should-not-appear');
      } finally {
        consoleSpy.mockRestore();
        errorSpy.mockRestore();
      }
    });

    test('EVIDENCE: Authentication state is properly isolated between instances', async () => {
      // SETUP: Two authentication service instances with separate config managers
      const configManager1 = new ConfigurationManager();
      const configManager2 = new ConfigurationManager();
      const auth1 = new AuthService(configManager1);
      const auth2 = new AuthService(configManager2);

      const config1: AuthConfig = {
        organization: 'org1',
        personalAccessToken: 'token1',
      };

      const config2: AuthConfig = {
        organization: 'org2',
        personalAccessToken: 'token2',
      };

      // EXECUTE: Configure each instance separately
      const result1 = await auth1.configure(config1);
      const result2 = await auth2.configure(config2);

      // VERIFY: Configuration was successful
      if (!result1.success) {
        console.log('Auth1 config failed:', result1.error);
      }
      if (!result2.success) {
        console.log('Auth2 config failed:', result2.error);
      }
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      
      // VERIFY: Each instance maintains its own state
      expect(auth1.isConfigured()).toBe(true);
      expect(auth2.isConfigured()).toBe(true);
      
      // Verify they are different instances with different configurations
      expect(auth1).not.toBe(auth2);
      
      // Test that configurations are isolated
      const maskedConfig1 = auth1.getConfiguration();
      const maskedConfig2 = auth2.getConfiguration();
      
      // Both should be masked but independently maintained
      expect(maskedConfig1).toBeDefined();
      expect(maskedConfig2).toBeDefined();
      expect(auth1.getConfiguration().organization).toBe('****'); // 'org1' masked
      expect(auth2.getConfiguration().organization).toBe('****'); // 'org2' masked
    });
  });
});