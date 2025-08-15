// Direct PBI creation for F&B Pricing project
const { WorkItemService } = require('./dist/workitem/WorkItemService');
const { ApiClient } = require('./dist/client/ApiClient');
require('dotenv').config();

async function createFnBPBI() {
    try {
        // Initialize API client with basic config
        const apiConfig = {
            baseUrl: `https://dev.azure.com/dimitri0310`,
            timeout: 30000,
            retryAttempts: 3,
            retryDelay: 1000,
            rateLimit: {
                requests: 200,
                windowMs: 60000
            }
        };
        
        const apiClient = new ApiClient(apiConfig);
        
        // Authenticate
        await apiClient.authenticate({
            organization: 'dimitri0310',
            personalAccessToken: process.env.AZURE_DEVOPS_PAT,
            project: 'fnb-pricing'
        });
        
        const workItemService = new WorkItemService(apiClient);
        
        // Create F&B Dynamic Pricing User Story
        const newPBI = {
            workItemType: 'User Story',
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
                'Microsoft.VSTS.Common.Priority': 1,
                'Microsoft.VSTS.Common.ValueArea': 'Business',
                'Microsoft.VSTS.Scheduling.StoryPoints': 8,
                'System.State': 'New'
            }
        };
        
        console.log('🍽️ Creating F&B Dynamic Pricing PBI...');
        const result = await workItemService.createWorkItem(newPBI);
        
        if (result.success && result.workItem) {
            console.log('✅ F&B Pricing PBI created successfully!');
            console.log(`📋 ID: ${result.workItem.id}`);
            console.log(`📝 Title: ${result.workItem.fields['System.Title']}`);
            console.log(`📊 Story Points: ${result.workItem.fields['Microsoft.VSTS.Scheduling.StoryPoints']}`);
            console.log(`🔗 View in Azure DevOps: https://dev.azure.com/dimitri0310/fnb-pricing/_workitems/edit/${result.workItem.id}`);
        } else {
            console.error('❌ Failed to create PBI:', result.error?.userMessage || 'Unknown error');
            if (result.error) {
                console.error('Error details:', {
                    code: result.error.code,
                    category: result.error.category,
                    message: result.error.message
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run it
createFnBPBI();