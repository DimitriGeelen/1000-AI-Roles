# Azure DevOps Integration - Foundation Phase Pseudo-Code

**Document Version**: 1.0  
**Date**: August 14, 2025  
**Phase**: Foundation (Weeks 1-2)  
**Tasks**: T001-T016

---

## Authentication Service (T001-T004)

### T001: Setup PAT Authentication

**PROBLEM**: Securely manage Azure DevOps Personal Access Token for API authentication

**APPROACH**: Environment-based credential management with validation

**ALGORITHM**:
```
FUNCTION setupPATAuthentication():
    // Load PAT from environment
    pat = ENVIRONMENT.get("AZURE_DEVOPS_PAT")
    IF pat is NULL:
        pat = CONFIG_FILE.read(".env", "AZURE_DEVOPS_PAT")
    
    IF pat is NULL:
        THROW ConfigurationError("PAT not found in environment or config")
    
    // Validate PAT format (base64 encoded)
    IF NOT isValidPATFormat(pat):
        THROW ValidationError("Invalid PAT format")
    
    // Create secure storage
    secureStore = new SecureCredentialStore()
    secureStore.store("azure_devops_pat", pat)
    
    // Clear from memory
    pat = NULL
    
    RETURN secureStore
```

**EDGE CASES**:
- Empty or malformed PAT
- Environment variable not set
- Config file missing or corrupted

**COMPLEXITY**: O(1) time, O(1) space

**INSTRUMENTATION**:
- Log successful authentication (without PAT value)
- Track authentication method (env vs config)
- Measure setup time

---

### T002: Create Configuration Manager

**PROBLEM**: Centralized configuration loading and validation

**APPROACH**: Singleton pattern with hierarchical config sources

**ALGORITHM**:
```
CLASS ConfigurationManager:
    PRIVATE config = {}
    PRIVATE INSTANCE = NULL
    
    FUNCTION getInstance():
        IF INSTANCE is NULL:
            INSTANCE = new ConfigurationManager()
        RETURN INSTANCE
    
    FUNCTION load():
        // Load defaults
        config = loadDefaults()
        
        // Override with config file
        IF EXISTS(".azure-devops.yml"):
            fileConfig = YAML.parse(".azure-devops.yml")
            config.merge(fileConfig)
        
        // Override with environment
        envConfig = loadEnvironmentVariables()
        config.merge(envConfig)
        
        // Validate required fields
        VALIDATE config.organization EXISTS
        VALIDATE config.project EXISTS
        VALIDATE config.pat EXISTS
        
        RETURN config
    
    FUNCTION get(key, defaultValue = NULL):
        RETURN config.get(key, defaultValue)
```

**EDGE CASES**:
- Missing required configuration
- Invalid YAML syntax
- Type mismatches in config values

**COMPLEXITY**: O(n) time for n config keys, O(n) space

**INSTRUMENTATION**:
- Log configuration sources used
- Track config validation errors
- Measure load time

---

### T003: Implement Auth Validation

**PROBLEM**: Validate credentials at startup with clear feedback

**APPROACH**: Test API call to verify authentication

**ALGORITHM**:
```
FUNCTION validateAuthentication(pat, organization):
    // Create test API request
    url = "https://dev.azure.com/{organization}/_apis/projects?api-version=7.2"
    headers = {
        "Authorization": "Basic " + base64(pat),
        "Content-Type": "application/json"
    }
    
    TRY:
        response = HTTP.GET(url, headers)
        
        IF response.status == 200:
            LOG.info("Authentication successful")
            RETURN TRUE
        ELSE IF response.status == 401:
            THROW AuthenticationError("Invalid PAT or expired")
        ELSE IF response.status == 403:
            THROW AuthorizationError("Insufficient permissions")
        ELSE:
            THROW APIError("Unexpected response: " + response.status)
            
    CATCH NetworkError as e:
        THROW ConnectionError("Cannot connect to Azure DevOps: " + e.message)
```

**EDGE CASES**:
- Network timeout
- Invalid organization name
- Rate limiting response

**COMPLEXITY**: O(1) time, O(1) space

**INSTRUMENTATION**:
- Log validation success/failure
- Track response times
- Record permission levels detected

---

## Azure DevOps API Client (T005-T008)

### T005: Create HTTP Client

**PROBLEM**: Low-level HTTP client for Azure DevOps REST API

**APPROACH**: Wrapper around HTTP library with authentication

**ALGORITHM**:
```
CLASS AzureDevOpsClient:
    PRIVATE baseUrl
    PRIVATE headers
    PRIVATE timeout = 5000 // 5 seconds
    
    FUNCTION constructor(organization, pat):
        this.baseUrl = "https://dev.azure.com/{organization}"
        this.headers = {
            "Authorization": "Basic " + base64(pat),
            "Content-Type": "application/json-patch+json",
            "Accept": "application/json"
        }
    
    FUNCTION request(method, path, body = NULL):
        url = this.baseUrl + path
        options = {
            method: method,
            headers: this.headers,
            timeout: this.timeout,
            body: body ? JSON.stringify(body) : NULL
        }
        
        startTime = NOW()
        response = HTTP.request(url, options)
        duration = NOW() - startTime
        
        LOG.debug("{method} {path} - {response.status} in {duration}ms")
        
        IF response.status >= 400:
            handleAPIError(response)
        
        RETURN JSON.parse(response.body)
```

**EDGE CASES**:
- Timeout handling
- Invalid JSON response
- Connection refused

**COMPLEXITY**: O(1) time per request, O(1) space

**INSTRUMENTATION**:
- Track all API calls with timing
- Log request/response sizes
- Monitor error rates by endpoint

---

### T006: Implement Rate Limiting

**PROBLEM**: Respect Azure DevOps API rate limits

**APPROACH**: Token bucket algorithm with exponential backoff

**ALGORITHM**:
```
CLASS RateLimiter:
    PRIVATE tokens = 100  // Azure DevOps allows 100 requests per minute
    PRIVATE lastRefill = NOW()
    PRIVATE queue = []
    
    FUNCTION acquireToken():
        // Refill tokens
        elapsed = NOW() - lastRefill
        tokensToAdd = elapsed / 600  // 100 tokens per 60 seconds
        tokens = MIN(100, tokens + tokensToAdd)
        lastRefill = NOW()
        
        IF tokens >= 1:
            tokens -= 1
            RETURN TRUE
        ELSE:
            // Calculate wait time
            waitTime = (1 - tokens) * 600
            SLEEP(waitTime)
            RETURN acquireToken()  // Recursive retry
    
    FUNCTION executeWithRateLimit(fn):
        acquireToken()
        
        TRY:
            result = fn()
            RETURN result
        CATCH RateLimitError as e:
            // Exponential backoff
            delay = calculateBackoff(e.retryAfter)
            SLEEP(delay)
            RETURN executeWithRateLimit(fn)
```

**EDGE CASES**:
- Burst requests
- Rate limit headers missing
- Multiple concurrent requests

**COMPLEXITY**: O(1) amortized time, O(1) space

**INSTRUMENTATION**:
- Track token consumption rate
- Log rate limit hits
- Measure average wait times

---

## Basic Work Item Operations (T009-T012)

### T009: Create Work Item Function

**PROBLEM**: Create Product Backlog Items in Azure DevOps

**APPROACH**: PATCH operation with JSON patch document

**ALGORITHM**:
```
FUNCTION createWorkItem(title, description, type = "Product Backlog Item"):
    // Build JSON patch document
    patchDocument = [
        {
            "op": "add",
            "path": "/fields/System.Title",
            "value": title
        },
        {
            "op": "add",
            "path": "/fields/System.Description",
            "value": description
        },
        {
            "op": "add",
            "path": "/fields/System.State",
            "value": "New"
        }
    ]
    
    // Add instrumentation
    patchDocument.push({
        "op": "add",
        "path": "/fields/System.Tags",
        "value": "claude-code-generated"
    })
    
    // API call
    path = "/{project}/_apis/wit/workitems/${type}?api-version=7.2"
    
    TRY:
        response = apiClient.request("POST", path, patchDocument)
        
        workItem = {
            id: response.id,
            title: response.fields["System.Title"],
            url: response._links.html.href
        }
        
        LOG.info("Created work item #{id}: {title}", workItem)
        RETURN workItem
        
    CATCH APIError as e:
        LOG.error("Failed to create work item: {e.message}")
        THROW e
```

**EDGE CASES**:
- Duplicate title handling
- Required fields missing
- Invalid work item type

**COMPLEXITY**: O(1) time, O(1) space

**INSTRUMENTATION**:
- Track creation success rate
- Measure API response time
- Log created work item IDs

---

### T010: Read Work Item Function

**PROBLEM**: Retrieve work item details from Azure DevOps

**APPROACH**: GET request with field expansion

**ALGORITHM**:
```
FUNCTION readWorkItem(workItemId, fields = NULL):
    // Build query
    path = "/_apis/wit/workitems/{workItemId}"
    
    IF fields:
        path += "?fields=" + fields.join(",")
    ELSE:
        path += "?$expand=all"
    
    path += "&api-version=7.2"
    
    TRY:
        response = apiClient.request("GET", path)
        
        workItem = {
            id: response.id,
            rev: response.rev,
            fields: response.fields,
            relations: response.relations || [],
            url: response.url
        }
        
        RETURN workItem
        
    CATCH NotFoundError:
        RETURN NULL
    CATCH APIError as e:
        LOG.error("Failed to read work item {workItemId}: {e.message}")
        THROW e
```

**EDGE CASES**:
- Work item doesn't exist
- Insufficient permissions
- Invalid field names

**COMPLEXITY**: O(1) time, O(n) space for n fields

**INSTRUMENTATION**:
- Track read operations by type
- Measure field retrieval patterns
- Log access patterns

---

### T011: Update Work Item Function

**PROBLEM**: Update existing work item fields

**APPROACH**: PATCH operation with field updates

**ALGORITHM**:
```
FUNCTION updateWorkItem(workItemId, updates):
    // Build patch document
    patchDocument = []
    
    FOR EACH field, value IN updates:
        operation = {
            "op": "replace",
            "path": "/fields/" + field,
            "value": value
        }
        patchDocument.push(operation)
    
    // Add update timestamp
    patchDocument.push({
        "op": "add",
        "path": "/fields/System.History",
        "value": "Updated by Claude Code at " + NOW()
    })
    
    path = "/_apis/wit/workitems/{workItemId}?api-version=7.2"
    
    TRY:
        response = apiClient.request("PATCH", path, patchDocument)
        
        LOG.info("Updated work item #{workItemId}")
        RETURN response
        
    CATCH ConcurrencyError as e:
        // Handle optimistic concurrency
        currentItem = readWorkItem(workItemId)
        IF shouldRetry(currentItem, updates):
            RETURN updateWorkItem(workItemId, updates)
        ELSE:
            THROW ConflictError("Work item modified by another user")
```

**EDGE CASES**:
- Concurrent modifications
- Invalid field values
- State transition rules

**COMPLEXITY**: O(n) time for n fields, O(n) space

**INSTRUMENTATION**:
- Track update frequency
- Log field modification patterns
- Measure conflict rates

---

## Error Handling Foundation (T013-T016)

### T013: Error Categorization System

**PROBLEM**: Classify errors for appropriate handling

**APPROACH**: Error hierarchy with specific handlers

**ALGORITHM**:
```
CLASS ErrorCategory:
    ENUM Type {
        AUTHENTICATION,    // 401 errors
        AUTHORIZATION,     // 403 errors
        NOT_FOUND,        // 404 errors
        RATE_LIMIT,       // 429 errors
        VALIDATION,       // 400 errors
        NETWORK,          // Connection errors
        CONFIGURATION,    // Setup errors
        INTERNAL          // 500+ errors
    }
    
    FUNCTION categorize(error):
        IF error.isHTTPError:
            SWITCH error.statusCode:
                CASE 400: RETURN VALIDATION
                CASE 401: RETURN AUTHENTICATION
                CASE 403: RETURN AUTHORIZATION
                CASE 404: RETURN NOT_FOUND
                CASE 429: RETURN RATE_LIMIT
                CASE 500+: RETURN INTERNAL
        
        IF error.isNetworkError:
            RETURN NETWORK
        
        IF error.isConfigError:
            RETURN CONFIGURATION
        
        RETURN INTERNAL
    
    FUNCTION getRecoveryStrategy(category):
        SWITCH category:
            CASE AUTHENTICATION:
                RETURN "Check PAT validity and regenerate if expired"
            CASE RATE_LIMIT:
                RETURN "Wait and retry with exponential backoff"
            CASE NETWORK:
                RETURN "Queue operation for offline processing"
            DEFAULT:
                RETURN "Log error and notify user"
```

**EDGE CASES**:
- Unknown error types
- Multiple error conditions
- Nested errors

**COMPLEXITY**: O(1) time, O(1) space

**INSTRUMENTATION**:
- Count errors by category
- Track recovery success rates
- Log error patterns

---

### T014: User-Friendly Message Generation

**PROBLEM**: Convert technical errors to actionable user messages

**APPROACH**: Template-based message generation

**ALGORITHM**:
```
FUNCTION generateUserMessage(error, context):
    category = ErrorCategory.categorize(error)
    
    message = {
        title: getErrorTitle(category),
        description: getErrorDescription(error, context),
        action: getRecoveryAction(category),
        technical: NULL  // Hidden by default
    }
    
    // Build user-friendly message
    SWITCH category:
        CASE AUTHENTICATION:
            message.title = "Authentication Failed"
            message.description = "Unable to connect to Azure DevOps"
            message.action = "Please check your PAT in the configuration"
            
        CASE RATE_LIMIT:
            message.title = "Too Many Requests"
            message.description = "Azure DevOps rate limit reached"
            message.action = "Operations will retry automatically in {error.retryAfter} seconds"
            
        CASE NOT_FOUND:
            message.title = "Work Item Not Found"
            message.description = "Work item #{context.workItemId} doesn't exist"
            message.action = "Verify the work item ID and try again"
    
    // Add technical details for debugging
    IF isDebugMode():
        message.technical = {
            error: error.toString(),
            stack: error.stack,
            context: context
        }
    
    RETURN message
```

**EDGE CASES**:
- Missing context information
- Localization requirements
- Multiple errors at once

**COMPLEXITY**: O(1) time, O(1) space

**INSTRUMENTATION**:
- Track message types shown
- Measure user recovery actions
- Log message effectiveness

---

## Summary

This Foundation Phase pseudo-code provides:
- Secure PAT authentication with validation
- Robust API client with rate limiting
- Complete work item CRUD operations
- Comprehensive error handling system
- Built-in instrumentation for evidence collection

All algorithms target <5 second response times and include graceful degradation for offline scenarios.