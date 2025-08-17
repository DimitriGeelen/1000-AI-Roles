// List all PBIs (Product Backlog Items) from Azure DevOps
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

async function listPBIs() {
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
        
        // WIQL query to get all User Stories (PBIs)
        const wiqlUrl = `https://dev.azure.com/${organization}/${project}/_apis/wit/wiql?api-version=7.1-preview.2`;
        
        const wiqlQuery = {
            "query": `SELECT [System.Id], [System.Title], [System.State], [Microsoft.VSTS.Scheduling.StoryPoints], [System.AssignedTo], [System.CreatedDate], [Microsoft.VSTS.Common.Priority]
                     FROM WorkItems 
                     WHERE [System.TeamProject] = '${project}' 
                     AND [System.WorkItemType] IN ('User Story', 'Product Backlog Item')
                     ORDER BY [Microsoft.VSTS.Common.Priority] ASC, [System.CreatedDate] DESC`
        };
        
        console.log('🔍 Fetching PBIs from Azure DevOps...');
        console.log(`📍 Organization: ${organization}`);
        console.log(`📂 Project: ${project}\n`);
        
        // Execute WIQL query
        const queryResponse = await axios.post(wiqlUrl, wiqlQuery, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000
        });
        
        if (queryResponse.data.workItems && queryResponse.data.workItems.length > 0) {
            const workItemIds = queryResponse.data.workItems.map(wi => wi.id).join(',');
            
            // Get work item details
            const detailsUrl = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems?ids=${workItemIds}&$expand=all&api-version=7.1-preview.3`;
            
            const detailsResponse = await axios.get(detailsUrl, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Accept': 'application/json'
                },
                timeout: 30000
            });
            
            console.log(`📋 Found ${detailsResponse.data.value.length} PBI(s):\n`);
            console.log('═'.repeat(100));
            
            detailsResponse.data.value.forEach((workItem, index) => {
                const fields = workItem.fields;
                console.log(`\n#${index + 1}. [ID: ${workItem.id}] ${fields['System.Title']}`);
                console.log('─'.repeat(80));
                console.log(`   📊 State: ${fields['System.State'] || 'Not set'}`);
                console.log(`   🎯 Priority: ${fields['Microsoft.VSTS.Common.Priority'] || 'Not set'}`);
                console.log(`   📈 Story Points: ${fields['Microsoft.VSTS.Scheduling.StoryPoints'] || 'Not estimated'}`);
                console.log(`   👤 Assigned To: ${fields['System.AssignedTo']?.displayName || 'Unassigned'}`);
                console.log(`   📅 Created: ${new Date(fields['System.CreatedDate']).toLocaleDateString()}`);
                console.log(`   🔗 Link: https://dev.azure.com/${organization}/${project}/_workitems/edit/${workItem.id}`);
                
                // Show description if available (first 200 chars)
                if (fields['System.Description']) {
                    const description = fields['System.Description']
                        .replace(/<[^>]*>/g, '') // Remove HTML tags
                        .replace(/\s+/g, ' ')     // Normalize whitespace
                        .trim();
                    const shortDesc = description.length > 200 
                        ? description.substring(0, 200) + '...' 
                        : description;
                    console.log(`   📝 Description: ${shortDesc}`);
                }
            });
            
            console.log('\n' + '═'.repeat(100));
            console.log(`\n✅ Total PBIs: ${detailsResponse.data.value.length}`);
            
            // Summary statistics
            const states = {};
            let totalPoints = 0;
            let estimatedCount = 0;
            
            detailsResponse.data.value.forEach(wi => {
                const state = wi.fields['System.State'] || 'Unknown';
                states[state] = (states[state] || 0) + 1;
                
                const points = wi.fields['Microsoft.VSTS.Scheduling.StoryPoints'];
                if (points) {
                    totalPoints += points;
                    estimatedCount++;
                }
            });
            
            console.log('\n📊 Summary:');
            console.log('   States:', Object.entries(states).map(([k, v]) => `${k}: ${v}`).join(', '));
            if (estimatedCount > 0) {
                console.log(`   Total Story Points: ${totalPoints} (${estimatedCount} items estimated)`);
            }
            
        } else {
            console.log('📭 No PBIs found in the project.');
        }
        
    } catch (error) {
        console.error('❌ Failed to retrieve PBIs:');
        
        if (error.response) {
            console.error(`HTTP ${error.response.status}: ${error.response.statusText}`);
            if (error.response.data) {
                console.error('Response:', JSON.stringify(error.response.data, null, 2));
            }
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Run the query
listPBIs().then(() => {
    console.log('\n🏁 Query complete.');
});

module.exports = { listPBIs };