// Azure DevOps Planner Implementation
// Handles standardized commands and translates to Azure DevOps API calls

const axios = require('axios');
require('dotenv').config();

class AzureDevOpsPlanner {
    constructor() {
        this.organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
        this.project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
        this.pat = process.env.AZURE_DEVOPS_PAT;
        
        if (!this.pat) {
            throw new Error('AZURE_DEVOPS_PAT environment variable is required');
        }
        
        this.auth = Buffer.from(`:${this.pat}`).toString('base64');
        this.baseUrl = `https://dev.azure.com/${this.organization}/${this.project}`;
        this.apiVersion = '7.1-preview.3';
    }

    // Main command processor
    async processCommand(command) {
        console.log(`📥 Processing command: ${command.command} from ${command.agent}`);
        
        try {
            switch (command.command) {
                case 'CREATE_WORK_ITEM':
                    return await this.createWorkItem(command);
                case 'UPDATE_STATUS':
                    return await this.updateStatus(command);
                case 'ATTACH_EVIDENCE':
                    return await this.attachEvidence(command);
                case 'LINK_ITEMS':
                    return await this.linkItems(command);
                case 'REPORT_METRICS':
                    return await this.reportMetrics(command);
                case 'REQUEST_BYPASS':
                    return await this.requestBypass(command);
                default:
                    throw new Error(`Unknown command: ${command.command}`);
            }
        } catch (error) {
            return this.errorResponse(error.message);
        }
    }

    // Create work item
    async createWorkItem(command) {
        const { type, title, description, parent_id, priority, estimate, tags } = command.data;
        
        // Map standardized types to Azure DevOps
        const typeMap = {
            'Epic': 'Epic',
            'Feature': 'Feature', 
            'UserStory': 'User Story',
            'PBI': 'Product Backlog Item',
            'Task': 'Task',
            'Bug': 'Bug'
        };
        
        const workItemType = typeMap[type] || type;
        const url = `${this.baseUrl}/_apis/wit/workitems/$${workItemType}?api-version=${this.apiVersion}`;
        
        const operations = [
            { op: 'add', path: '/fields/System.Title', value: title }
        ];
        
        if (description) {
            operations.push({ op: 'add', path: '/fields/System.Description', value: description });
        }
        
        if (parent_id) {
            operations.push({ 
                op: 'add', 
                path: '/relations/-', 
                value: {
                    rel: 'System.LinkTypes.Hierarchy-Reverse',
                    url: `${this.baseUrl}/_apis/wit/workitems/${parent_id}`
                }
            });
        }
        
        if (priority) {
            operations.push({ op: 'add', path: '/fields/Microsoft.VSTS.Common.Priority', value: priority });
        }
        
        if (estimate) {
            operations.push({ op: 'add', path: '/fields/Microsoft.VSTS.Scheduling.StoryPoints', value: estimate });
        }
        
        if (tags && tags.length > 0) {
            operations.push({ op: 'add', path: '/fields/System.Tags', value: tags.join('; ') });
        }
        
        // Add traceability comment
        operations.push({
            op: 'add',
            path: '/fields/System.History',
            value: `Created by ${command.agent} agent via Azure DevOps Planner`
        });
        
        try {
            const response = await axios.post(url, operations, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json-patch+json'
                }
            });
            
            const workItem = response.data;
            console.log(`✅ Created ${type} #${workItem.id}: ${title}`);
            
            return {
                success: true,
                work_item_id: workItem.id,
                work_item_url: `${this.baseUrl}/_workitems/edit/${workItem.id}`,
                state: workItem.fields['System.State'],
                message: `Created ${type} #${workItem.id}`,
                bypass_required: false
            };
        } catch (error) {
            throw new Error(`Failed to create work item: ${error.message}`);
        }
    }

    // Update work item status
    async updateStatus(command) {
        const { work_item_id } = command;
        const { status, comment } = command.data;
        
        // Validate state transition
        const currentState = await this.getWorkItemState(work_item_id);
        if (!this.isValidTransition(currentState, status)) {
            return {
                success: false,
                work_item_id,
                state: currentState,
                message: `Invalid state transition: ${currentState} → ${status}`,
                bypass_required: true
            };
        }
        
        const url = `${this.baseUrl}/_apis/wit/workitems/${work_item_id}?api-version=${this.apiVersion}`;
        
        const operations = [
            { op: 'add', path: '/fields/System.State', value: status }
        ];
        
        if (comment) {
            operations.push({
                op: 'add',
                path: '/fields/System.History',
                value: `${comment} (Updated by ${command.agent} agent)`
            });
        }
        
        try {
            const response = await axios.patch(url, operations, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json-patch+json'
                }
            });
            
            const workItem = response.data;
            console.log(`✅ Updated work item #${work_item_id} status to ${status}`);
            
            // Check if parent items need updating
            await this.updateParentStatus(work_item_id);
            
            return {
                success: true,
                work_item_id,
                work_item_url: `${this.baseUrl}/_workitems/edit/${work_item_id}`,
                state: status,
                message: `Updated status to ${status}`,
                bypass_required: false
            };
        } catch (error) {
            throw new Error(`Failed to update status: ${error.message}`);
        }
    }

    // Attach evidence to work item
    async attachEvidence(command) {
        const { work_item_id } = command;
        const { evidence, evidence_name, evidence_type, description } = command.data;
        
        // First, upload the attachment
        const uploadUrl = `${this.baseUrl}/_apis/wit/attachments?fileName=${evidence_name}&api-version=${this.apiVersion}`;
        const fileContent = Buffer.from(evidence, 'base64');
        
        try {
            const uploadResponse = await axios.post(uploadUrl, fileContent, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/octet-stream'
                }
            });
            
            const attachmentUrl = uploadResponse.data.url;
            
            // Now link the attachment to the work item
            const workItemUrl = `${this.baseUrl}/_apis/wit/workitems/${work_item_id}?api-version=${this.apiVersion}`;
            
            const operations = [
                {
                    op: 'add',
                    path: '/relations/-',
                    value: {
                        rel: 'AttachedFile',
                        url: attachmentUrl,
                        attributes: {
                            comment: description || `${evidence_type} evidence from ${command.agent}`
                        }
                    }
                },
                {
                    op: 'add',
                    path: '/fields/System.History',
                    value: `Attached ${evidence_name} (${evidence_type}) by ${command.agent} agent`
                }
            ];
            
            const response = await axios.patch(workItemUrl, operations, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json-patch+json'
                }
            });
            
            console.log(`✅ Attached ${evidence_name} to work item #${work_item_id}`);
            
            return {
                success: true,
                work_item_id,
                work_item_url: `${this.baseUrl}/_workitems/edit/${work_item_id}`,
                state: response.data.fields['System.State'],
                message: `Attached ${evidence_name}`,
                bypass_required: false
            };
        } catch (error) {
            throw new Error(`Failed to attach evidence: ${error.message}`);
        }
    }

    // Link work items
    async linkItems(command) {
        const { work_item_id } = command;
        const { target_ids, link_type, external_links } = command.data;
        
        const url = `${this.baseUrl}/_apis/wit/workitems/${work_item_id}?api-version=${this.apiVersion}`;
        const operations = [];
        
        // Add work item links
        if (target_ids && target_ids.length > 0) {
            for (const targetId of target_ids) {
                operations.push({
                    op: 'add',
                    path: '/relations/-',
                    value: {
                        rel: this.mapLinkType(link_type),
                        url: `${this.baseUrl}/_apis/wit/workitems/${targetId}`
                    }
                });
            }
        }
        
        // Add external links
        if (external_links && external_links.length > 0) {
            for (const link of external_links) {
                operations.push({
                    op: 'add',
                    path: '/relations/-',
                    value: {
                        rel: 'Hyperlink',
                        url: link.url,
                        attributes: {
                            comment: link.description || `${link.type} from ${command.agent}`
                        }
                    }
                });
            }
        }
        
        operations.push({
            op: 'add',
            path: '/fields/System.History',
            value: `Links added by ${command.agent} agent for traceability`
        });
        
        try {
            const response = await axios.patch(url, operations, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json-patch+json'
                }
            });
            
            console.log(`✅ Created links for work item #${work_item_id}`);
            
            return {
                success: true,
                work_item_id,
                work_item_url: `${this.baseUrl}/_workitems/edit/${work_item_id}`,
                state: response.data.fields['System.State'],
                message: `Links created successfully`,
                bypass_required: false
            };
        } catch (error) {
            throw new Error(`Failed to create links: ${error.message}`);
        }
    }

    // Report metrics
    async reportMetrics(command) {
        const { work_item_id } = command;
        const { metrics, timestamp } = command.data;
        
        // Format metrics as comment
        const metricsText = Object.entries(metrics)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\\n');
        
        const url = `${this.baseUrl}/_apis/wit/workitems/${work_item_id}?api-version=${this.apiVersion}`;
        
        const operations = [
            {
                op: 'add',
                path: '/fields/System.History',
                value: `📊 Metrics Report from ${command.agent}:\\n${metricsText}\\n(Timestamp: ${timestamp || new Date().toISOString()})`
            }
        ];
        
        // Update state based on test results if applicable
        if (metrics.tests_failed && metrics.tests_failed > 0) {
            // Create bugs for failures
            const bugIds = [];
            for (let i = 0; i < Math.min(metrics.tests_failed, 5); i++) {
                const bugCommand = {
                    command: 'CREATE_WORK_ITEM',
                    agent: command.agent,
                    data: {
                        type: 'Bug',
                        title: `Test failure in work item #${work_item_id}`,
                        description: `Automated bug created due to test failure. See parent item for details.`,
                        parent_id: work_item_id,
                        priority: 2
                    }
                };
                const bugResult = await this.createWorkItem(bugCommand);
                if (bugResult.success) {
                    bugIds.push(bugResult.work_item_id);
                }
            }
            
            operations.push({
                op: 'add',
                path: '/fields/System.History',
                value: `⚠️ Created ${bugIds.length} bug(s) for test failures: ${bugIds.join(', ')}`
            });
        }
        
        try {
            const response = await axios.patch(url, operations, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json-patch+json'
                }
            });
            
            console.log(`✅ Reported metrics for work item #${work_item_id}`);
            
            return {
                success: true,
                work_item_id,
                work_item_url: `${this.baseUrl}/_workitems/edit/${work_item_id}`,
                state: response.data.fields['System.State'],
                message: `Metrics reported successfully`,
                bypass_required: false
            };
        } catch (error) {
            throw new Error(`Failed to report metrics: ${error.message}`);
        }
    }

    // Request bypass for validation
    async requestBypass(command) {
        const { blocked_action, blocked_reason, justification, risk_level } = command.data;
        
        console.log(`🚨 BYPASS REQUEST from ${command.agent}:`);
        console.log(`   Action: ${blocked_action}`);
        console.log(`   Reason: ${blocked_reason}`);
        console.log(`   Justification: ${justification}`);
        console.log(`   Risk: ${risk_level}`);
        console.log(`⏳ Awaiting human approval...`);
        
        // In production, this would trigger a notification system
        // For now, we'll simulate approval after logging
        const bypassToken = `BYPASS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        return {
            success: false,
            message: 'Bypass request logged - awaiting human approval',
            bypass_required: true,
            bypass_token: bypassToken,
            warnings: ['Human approval required to proceed']
        };
    }

    // Helper: Get current work item state
    async getWorkItemState(workItemId) {
        const url = `${this.baseUrl}/_apis/wit/workitems/${workItemId}?api-version=${this.apiVersion}`;
        
        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Basic ${this.auth}`
                }
            });
            
            return response.data.fields['System.State'];
        } catch (error) {
            throw new Error(`Failed to get work item state: ${error.message}`);
        }
    }

    // Helper: Validate state transitions
    isValidTransition(currentState, newState) {
        const transitions = {
            'New': ['Active', 'Approved', 'Removed'],
            'Approved': ['Committed', 'Active', 'New'],
            'Committed': ['Active', 'Approved'],
            'Active': ['Resolved', 'New', 'Blocked'],
            'Resolved': ['Closed', 'Active'],
            'Closed': ['Active'],
            'To Do': ['In Progress', 'Removed'],
            'In Progress': ['Done', 'To Do'],
            'Done': ['In Progress']
        };
        
        const allowed = transitions[currentState] || [];
        return allowed.includes(newState);
    }

    // Helper: Update parent status if all children complete
    async updateParentStatus(workItemId) {
        // Query for parent and sibling items
        const wiql = `
            SELECT [System.Id], [System.State] 
            FROM WorkItemLinks 
            WHERE Source.[System.Id] IN (
                SELECT [System.Id] 
                FROM WorkItemLinks 
                WHERE Target.[System.Id] = ${workItemId}
                AND [System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward'
            )
            AND [System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward'
            MODE (MustContain)
        `;
        
        // Check if all siblings are complete and update parent accordingly
        // Implementation would query Azure DevOps and update parent state
        console.log(`📍 Checking if parent item needs status update...`);
    }

    // Helper: Map standardized link types to Azure DevOps
    mapLinkType(linkType) {
        const linkMap = {
            'Parent': 'System.LinkTypes.Hierarchy-Reverse',
            'Child': 'System.LinkTypes.Hierarchy-Forward',
            'Related': 'System.LinkTypes.Related',
            'Tests': 'Microsoft.VSTS.Common.TestedBy-Forward',
            'TestedBy': 'Microsoft.VSTS.Common.TestedBy-Reverse',
            'Blocks': 'System.LinkTypes.Dependency-Forward',
            'BlockedBy': 'System.LinkTypes.Dependency-Reverse'
        };
        
        return linkMap[linkType] || 'System.LinkTypes.Related';
    }

    // Helper: Error response format
    errorResponse(message) {
        return {
            success: false,
            message,
            errors: [message],
            bypass_required: false
        };
    }
}

// Export for use by agents
module.exports = AzureDevOpsPlanner;

// Example usage
if (require.main === module) {
    const planner = new AzureDevOpsPlanner();
    
    // Example command from an agent
    const exampleCommand = {
        command: 'CREATE_WORK_ITEM',
        agent: 'requirements-collector',
        data: {
            type: 'Feature',
            title: 'User Authentication System',
            description: 'Implement secure user authentication with OAuth2',
            parent_id: 1,
            priority: 1,
            estimate: 13
        }
    };
    
    planner.processCommand(exampleCommand)
        .then(result => console.log('Result:', JSON.stringify(result, null, 2)))
        .catch(error => console.error('Error:', error));
}