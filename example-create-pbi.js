// Example: Create a Product Backlog Item (User Story) in Azure DevOps
// This shows how to use the WorkItemService to create a new PBI

const { WorkItemService } = require('./dist/workitem/WorkItemService');
const { ApiClient } = require('./dist/client/ApiClient');
const { ConfigurationManager } = require('./dist/config/ConfigurationManager');

async function createNewPBI() {
    try {
        // Step 1: Set up configuration
        // You'll need to set these environment variables or update the config
        const config = ConfigurationManager.load();
        
        // Step 2: Initialize API client and WorkItem service
        const apiClient = new ApiClient(config.api);
        await apiClient.authenticate({
            organization: process.env.AZURE_DEVOPS_ORG || 'dimitri0310',
            personalAccessToken: process.env.AZURE_DEVOPS_PAT || 'your-pat-token',
            project: process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing'
        });
        
        const workItemService = new WorkItemService(apiClient);
        
        // Step 3: Define your new PBI/User Story
        const newPBI = {
            workItemType: 'User Story',  // or 'Product Backlog Item' depending on your process template
            fields: {
                'System.Title': 'As a F&B manager, I want to set dynamic pricing rules for menu items',
                'System.Description': `
                    <p><strong>User Story:</strong> As a Food & Beverage manager, I want to configure dynamic pricing rules for menu items based on demand, time of day, and inventory levels so that I can optimize revenue and reduce food waste.</p>
                    
                    <p><strong>Business Value:</strong> Enable dynamic pricing to increase revenue by 15-20% during peak hours and reduce waste by adjusting prices for items with high inventory.</p>
                    
                    <p><strong>Acceptance Criteria:</strong></p>
                    <ul>
                        <li>Manager can create pricing rules based on time slots (breakfast, lunch, dinner)</li>
                        <li>System adjusts prices based on current demand levels</li>
                        <li>Inventory-based pricing reduces prices for items expiring soon</li>
                        <li>Price changes are reflected in POS system within 30 seconds</li>
                        <li>Historical pricing data is tracked for reporting</li>
                        <li>Override capability for special events/promotions</li>
                    </ul>
                `,
                'Microsoft.VSTS.Common.Priority': 1,  // High priority for F&B pricing
                'Microsoft.VSTS.Common.ValueArea': 'Business',  
                'System.AreaPath': 'fnb-pricing\\Pricing Engine',  
                'System.IterationPath': 'fnb-pricing\\Sprint 1', 
                'Microsoft.VSTS.Scheduling.StoryPoints': 5,
                'System.AssignedTo': 'user@yourdomain.com',  // Optional: assign to someone
                'System.State': 'New'  // New, Active, Resolved, Closed (depends on your process)
            },
            relations: [
                // Optional: Link to other work items
                // {
                //     rel: 'System.LinkTypes.Hierarchy-Reverse',  // Parent link
                //     url: 'https://dev.azure.com/your-org/your-project/_apis/wit/workItems/123'
                // }
            ]
        };
        
        // Step 4: Create the PBI
        console.log('Creating new PBI...');
        const result = await workItemService.createWorkItem(newPBI);
        
        if (result.success && result.workItem) {
            console.log('✅ PBI created successfully!');
            console.log(`📋 ID: ${result.workItem.id}`);
            console.log(`📝 Title: ${result.workItem.fields['System.Title']}`);
            console.log(`🔗 URL: https://dev.azure.com/dimitri0310/fnb-pricing/_workitems/edit/${result.workItem.id}`);
        } else {
            console.error('❌ Failed to create PBI:', result.error?.userMessage);
            if (result.error) {
                console.error('Error details:', result.error);
            }
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

// Run the example
if (require.main === module) {
    createNewPBI();
}

module.exports = { createNewPBI };