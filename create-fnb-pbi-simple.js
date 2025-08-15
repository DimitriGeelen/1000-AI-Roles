// Simple F&B PBI creation using direct API calls
const axios = require('axios');
require('dotenv').config();

async function createFnBPBI() {
    try {
        // Azure DevOps API configuration
        const organization = 'dimitri0310';
        const project = 'fnb-pricing';
        const pat = process.env.AZURE_DEVOPS_PAT;
        
        if (!pat) {
            throw new Error('AZURE_DEVOPS_PAT environment variable is not set');
        }
        
        // Create base64 encoded auth header
        const auth = Buffer.from(`:${pat}`).toString('base64');
        
        // Azure DevOps Work Items API endpoint
        const url = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/$User Story?api-version=7.1-preview.3`;
        
        // F&B Dynamic Pricing User Story
        const workItemData = [
            {
                "op": "add",
                "path": "/fields/System.Title",
                "value": "As a F&B manager, I want to set dynamic pricing rules for menu items"
            },
            {
                "op": "add", 
                "path": "/fields/System.Description",
                "value": `
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
                `
            },
            {
                "op": "add",
                "path": "/fields/Microsoft.VSTS.Common.Priority",
                "value": 1
            },
            {
                "op": "add",
                "path": "/fields/Microsoft.VSTS.Common.ValueArea", 
                "value": "Business"
            },
            {
                "op": "add",
                "path": "/fields/Microsoft.VSTS.Scheduling.StoryPoints",
                "value": 8
            },
            {
                "op": "add",
                "path": "/fields/System.State",
                "value": "New"
            }
        ];
        
        console.log('🍽️ Creating F&B Dynamic Pricing PBI in Azure DevOps...');
        console.log(`📍 Organization: ${organization}`);
        console.log(`📂 Project: ${project}`);
        
        const response = await axios.post(url, workItemData, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json-patch+json',
                'Accept': 'application/json'
            },
            timeout: 30000
        });
        
        if (response.status === 200) {
            const workItem = response.data;
            console.log('✅ F&B Pricing PBI created successfully!');
            console.log(`📋 Work Item ID: ${workItem.id}`);
            console.log(`📝 Title: ${workItem.fields['System.Title']}`);
            console.log(`📊 Story Points: ${workItem.fields['Microsoft.VSTS.Scheduling.StoryPoints']}`);
            console.log(`🔗 View in Azure DevOps: https://dev.azure.com/${organization}/${project}/_workitems/edit/${workItem.id}`);
            
            return {
                success: true,
                workItem: workItem,
                url: `https://dev.azure.com/${organization}/${project}/_workitems/edit/${workItem.id}`
            };
        }
        
    } catch (error) {
        console.error('❌ Failed to create F&B PBI:');
        
        if (error.response) {
            console.error(`HTTP ${error.response.status}: ${error.response.statusText}`);
            console.error('Response:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Error:', error.message);
        }
        
        return { success: false, error: error.message };
    }
}

// Run the creation
createFnBPBI().then(result => {
    if (result.success) {
        console.log('\n🎉 Your F&B Pricing project is ready for dynamic pricing development!');
    } else {
        console.log('\n❌ Need help troubleshooting the PBI creation.');
    }
});

module.exports = { createFnBPBI };