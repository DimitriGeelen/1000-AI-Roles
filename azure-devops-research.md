# Azure DevOps Organizations Integration Research

## Initial Research Summary

**Project Link**: https://dev.azure.com/dimitri0310/fnb-pricing/

**Goal**: Create a reusable component for Claude Code to programmatically connect to Azure DevOps organization and perform CRUD operations on PBIs (Product Backlog Items) and project documentation (testing outcomes, etc.).

## Key Technical Requirements from Research

### Authentication
- Personal Access Token (PAT) from Azure DevOps organization required
- Basic access to project + Analytics permissions needed
- REST API works with any language via HTTP requests
- Python client library available for easier implementation

### Implementation Approaches

#### Option 1: REST API Direct
```python
import requests
import base64

pat = 'YOUR_PAT'
authorization = str(base64.b64encode(bytes(':' + pat, 'ascii')), 'ascii')

headers = {
    'Content-Type': 'application/json-patch+json',
    'Authorization': 'Basic ' + authorization
}

url = "https://dev.azure.com/{OrganizationName}/{ProjectName}/_apis/wit/workitems/$Product Backlog Item?api-version=7.2"

body = [
    {"op": "add", "path": "/fields/System.Title", "value": "Sample PBI created via code"},
    {"op": "add", "path": "/fields/System.Description", "value": "Detailed description and test outcome"}
]

response = requests.post(url, json=body, headers=headers)
```

#### Option 2: Python Client Library
```python
from azure.devops.connection import Connection
from msrest.authentication import BasicAuthentication
from azure.devops.v6_0.work_item_tracking.models import JsonPatchOperation

token = 'YOUR_PAT'
team_instance = 'https://dev.azure.com/{OrganizationName}'
credentials = BasicAuthentication("", token)
connection = Connection(base_url=team_instance, creds=credentials)
wit_client = connection.clients.get_work_item_tracking_client()

documents = [
    JsonPatchOperation(from_=None, op='add', path='/fields/System.Title', value='Automated PBI'),
    JsonPatchOperation(from_=None, op='add', path='/fields/System.Description', value='Test outcome: Success')
]
result = wit_client.create_work_item(documents, "{ProjectName}", 'Product Backlog Item')
```

## CRUD Operations Needed
- **Create**: New PBIs and documentation
- **Read**: Existing PBIs and project information  
- **Update**: PBI fields, documentation, test outcomes
- **Delete**: PBIs when needed

## Reusability Requirements
- Single function/class encapsulation
- Parameterized for organization, project, item type, fields, actions
- Error handling and PAT security best practices
- Configurable for different organizations and projects

## Documentation Integration
- Add/update fields in PBIs (documentation, test outcomes, custom fields)
- Attach files or links using work item relations endpoint
- Support for testing outcome documentation

## Security Considerations
- PAT obfuscation best practices
- Secure credential storage
- Access control validation

## API Endpoints
- Work Items: `https://dev.azure.com/{OrganizationName}/{ProjectName}/_apis/wit/workitems/`
- API Version: 7.2
- HTTP Methods: GET, POST, PATCH, DELETE

## Next Steps
- Define specific user stories and use cases
- Determine MVP scope and prioritization
- Design architecture for reusable component
- Plan implementation approach