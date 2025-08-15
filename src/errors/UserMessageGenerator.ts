// User Message Generator for converting technical errors to user-friendly messages

import { AgentError } from '../types';

export type UserType = 'admin' | 'developer' | 'end_user';

export class UserMessageGenerator {
  public generateUserMessage(error: AgentError, userType: UserType = 'end_user'): string {
    switch (error.category) {
      case 'AUTH':
        return this.generateAuthMessage(error, userType);
      case 'NETWORK':
        return this.generateNetworkMessage(error, userType);
      case 'VALIDATION':
        return this.generateValidationMessage(error, userType);
      case 'RATE_LIMIT':
        return this.generateRateLimitMessage(error, userType);
      case 'API':
        return this.generateApiMessage(error, userType);
      default:
        return this.generateGenericMessage(error, userType);
    }
  }

  private generateAuthMessage(error: AgentError, userType: UserType): string {
    const baseMessage = 'Authentication failed';
    
    switch (error.code) {
      case 'AUTH_EXPIRED':
        return this.addRecoverySuggestion(
          'Your session has expired',
          'Please re-authenticate or refresh your access token',
          userType
        );
      
      case 'AUTH_INVALID':
        return this.addRecoverySuggestion(
          'Invalid credentials provided',
          'Please check your username and password',
          userType
        );
      
      case 'AUTH_UNAUTHORIZED':
        if (userType === 'admin') {
          return 'Unauthorized access. Check user permissions and token scopes.';
        }
        return this.addRecoverySuggestion(
          'You don\'t have permission to perform this action',
          'Contact your administrator for access',
          userType
        );
      
      case 'AUTH_FORBIDDEN':
        if (userType === 'end_user') {
          return 'You don\'t have permission to access this resource. Please contact your administrator.';
        }
        return 'Insufficient permissions for this operation. Check token scopes and user roles.';
      
      default:
        return this.addRecoverySuggestion(
          baseMessage,
          'Please check your credentials and try again',
          userType
        );
    }
  }

  private generateNetworkMessage(error: AgentError, userType: UserType): string {
    switch (error.code) {
      case 'NETWORK_TIMEOUT':
        return this.addRecoverySuggestion(
          'Connection timed out',
          'Please check your internet connection and try again',
          userType
        );
      
      case 'NETWORK_CONNECTION_REFUSED':
        if (userType === 'admin' || userType === 'developer') {
          return 'Unable to connect to Azure DevOps service. Check service status and network configuration.';
        }
        return this.addRecoverySuggestion(
          'Unable to connect to the service',
          'Please try again later or contact support if the problem persists',
          userType
        );
      
      case 'NETWORK_DNS_ERROR':
        if (userType === 'admin') {
          return 'DNS resolution failed. Check network configuration and DNS settings.';
        }
        return this.addRecoverySuggestion(
          'Network connection problem',
          'Please check your internet connection',
          userType
        );
      
      default:
        return this.addRecoverySuggestion(
          'Network connection failed',
          'Please check your connection and try again',
          userType
        );
    }
  }

  private generateValidationMessage(error: AgentError, userType: UserType): string {
    const message = error.message;
    
    // Extract field names and make them user-friendly
    let userFriendlyMessage = message
      .replace(/System\.Title/g, 'Title')
      .replace(/System\.Description/g, 'Description')
      .replace(/System\.State/g, 'State')
      .replace(/System\./g, '')
      .replace(/VALIDATION_/g, '')
      .replace(/_/g, ' ')
      .toLowerCase();
    
    // Capitalize first letter
    userFriendlyMessage = userFriendlyMessage.charAt(0).toUpperCase() + 
                         userFriendlyMessage.slice(1);

    switch (error.code) {
      case 'VALIDATION_REQUIRED_FIELD':
        return userFriendlyMessage + '. This field is required to continue.';
      
      case 'VALIDATION_FORMAT_ERROR':
        return userFriendlyMessage + '. Please check the format and try again.';
      
      default:
        return userFriendlyMessage + '. Please correct the highlighted fields.';
    }
  }

  private generateRateLimitMessage(error: AgentError, userType: UserType): string {
    const retryAfter = error.context.retryAfter || 60;
    const minutes = Math.ceil(retryAfter / 60);
    
    if (userType === 'developer') {
      return `Rate limit exceeded. Too many requests to the API. Wait ${retryAfter} seconds before retrying.`;
    }
    
    return this.addRecoverySuggestion(
      'Too many requests',
      `Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again`,
      userType
    );
  }

  private generateApiMessage(error: AgentError, userType: UserType): string {
    switch (error.code) {
      case 'API_NOT_FOUND':
        return 'The requested item was not found. It may have been deleted or moved.';
      
      case 'API_CONFLICT':
        return 'This item has been modified by another user. Please refresh and try again.';
      
      case 'API_SERVICE_UNAVAILABLE':
      case 'API_INTERNAL_ERROR':
        if (userType === 'admin') {
          return `Azure DevOps service is temporarily unavailable (${error.code}). Check service status.`;
        }
        return this.addRecoverySuggestion(
          'The service is temporarily unavailable',
          'Please try again in a few minutes',
          userType
        );
      
      default:
        if (userType === 'admin' || userType === 'developer') {
          return `API error occurred: ${error.code}. Status: ${error.context.statusCode || 'unknown'}`;
        }
        return this.addRecoverySuggestion(
          'An error occurred while processing your request',
          'Please try again or contact support if the problem persists',
          userType
        );
    }
  }

  private generateGenericMessage(error: AgentError, userType: UserType): string {
    if (error.severity === 'CRITICAL') {
      if (userType === 'end_user') {
        return 'A critical error occurred. Please contact support immediately.';
      }
      return `Critical system error: ${error.code}. Immediate attention required.`;
    }
    
    if (userType === 'admin' || userType === 'developer') {
      return `System error: ${error.code}. ${error.message}`;
    }
    
    return this.addRecoverySuggestion(
      'An unexpected error occurred',
      'Please try again or contact support for assistance',
      userType
    );
  }

  private addRecoverySuggestion(
    message: string, 
    suggestion: string, 
    userType: UserType
  ): string {
    if (userType === 'end_user') {
      return `${message}. ${suggestion}.`;
    }
    
    // For admin/developer, include more technical details
    return `${message}. ${suggestion}`;
  }
}