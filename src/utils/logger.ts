// Secure logging utility that masks sensitive information

export class SecureLogger {
  private static sensitivePatterns = [
    /personalAccessToken/gi,
    /token/gi,
    /password/gi,
    /secret/gi,
    /key/gi,
  ];

  public static log(message: string, data?: any): void {
    const sanitizedMessage = this.sanitize(message);
    const sanitizedData = data ? this.sanitize(JSON.stringify(data)) : undefined;
    
    console.log(sanitizedMessage, sanitizedData || '');
  }

  public static error(message: string, error?: any): void {
    const sanitizedMessage = this.sanitize(message);
    const sanitizedError = error ? this.sanitize(JSON.stringify(error)) : undefined;
    
    console.error(sanitizedMessage, sanitizedError || '');
  }

  public static warn(message: string, data?: any): void {
    const sanitizedMessage = this.sanitize(message);
    const sanitizedData = data ? this.sanitize(JSON.stringify(data)) : undefined;
    
    console.warn(sanitizedMessage, sanitizedData || '');
  }

  private static sanitize(text: string): string {
    let sanitized = text;
    
    // Replace any potential token values with asterisks
    sanitized = sanitized.replace(/([a-zA-Z0-9]{20,})/g, (match) => {
      // If it looks like a token (long alphanumeric string), mask it
      if (match.length > 20) {
        return '*'.repeat(match.length);
      }
      return match;
    });

    // Mask known sensitive patterns
    this.sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '***');
    });

    return sanitized;
  }
}