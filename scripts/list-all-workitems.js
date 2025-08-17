// List ALL work items (Epics, Features, PBIs, User Stories, Tasks, Bugs) from Azure DevOps
const axios = require('axios');
// Handle both project root and scripts directory execution
const path = require('path');
const fs = require('fs');

// Check if .env exists in current directory (scripts) or parent directory (project root)
const currentDirEnv = path.join(__dirname, '.env');
const parentDirEnv = path.join(__dirname, '../.env');

if (fs.existsSync(currentDirEnv)) {
    require('dotenv').config({ path: currentDirEnv });
} else if (fs.existsSync(parentDirEnv)) {
    require('dotenv').config({ path: parentDirEnv });
} else {
    require('dotenv').config(); // Default behavior
}

async function listAllWorkItems() {
    try {
        // Azure DevOps API configuration
        const organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
        const project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
        const pat = process.env.AZURE_DEVOPS_PAT;
        
        if (!pat) {
            throw new Error('AZURE_DEVOPS_PAT environment variable is not set');
        }
        
        // Create base64 encoded auth header
        const auth = Buffer.from(`:${pat}`).toString('base64');
        
        // WIQL query to get ALL work item types
        const wiqlUrl = `https://dev.azure.com/${organization}/${project}/_apis/wit/wiql?api-version=7.1-preview.2`;
        
        const wiqlQuery = {
            "query": `SELECT [System.Id], [System.Title], [System.State], [System.WorkItemType], [Microsoft.VSTS.Scheduling.StoryPoints], [System.AssignedTo], [System.CreatedDate], [Microsoft.VSTS.Common.Priority]
                     FROM WorkItems 
                     WHERE [System.TeamProject] = '${project}' 
                     ORDER BY [System.WorkItemType] ASC, [System.Id] ASC`
        };
        
        console.log('🔍 Fetching ALL work items from Azure DevOps...');
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
            
            // Get work item details with relations
            const detailsUrl = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems?ids=${workItemIds}&$expand=relations&api-version=7.1-preview.3`;
            
            const detailsResponse = await axios.get(detailsUrl, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Accept': 'application/json'
                },
                timeout: 30000
            });
            
            // Group work items by type
            const workItemsByType = {};
            detailsResponse.data.value.forEach(workItem => {
                const type = workItem.fields['System.WorkItemType'];
                if (!workItemsByType[type]) {
                    workItemsByType[type] = [];
                }
                workItemsByType[type].push(workItem);
            });
            
            console.log(`📋 Found ${detailsResponse.data.value.length} work item(s):\n`);
            console.log('═'.repeat(120));
            
            // Display by hierarchy: Epic → Feature → User Story/PBI → Task → Bug
            const typeOrder = ['Epic', 'Feature', 'User Story', 'Product Backlog Item', 'Task', 'Bug', 'Issue'];
            let totalStoryPoints = 0;
            let totalItems = 0;
            
            typeOrder.forEach(type => {
                if (workItemsByType[type]) {
                    console.log(`\n🎯 ${type.toUpperCase()}S (${workItemsByType[type].length}):`);
                    console.log('─'.repeat(100));
                    
                    workItemsByType[type].forEach((workItem, index) => {
                        const fields = workItem.fields;
                        const storyPoints = fields['Microsoft.VSTS.Scheduling.StoryPoints'] || 0;
                        const assignedTo = fields['System.AssignedTo']?.displayName || 'Unassigned';
                        const priority = fields['Microsoft.VSTS.Common.Priority'] || 'Not set';
                        
                        console.log(`\n${index + 1}. [ID: ${workItem.id}] ${fields['System.Title']}`);
                        console.log(`   📋 Type: ${fields['System.WorkItemType']}`);
                        console.log(`   📊 State: ${fields['System.State']}`);
                        if (storyPoints > 0) {
                            console.log(`   📈 Story Points: ${storyPoints}`);
                            totalStoryPoints += storyPoints;
                        }
                        console.log(`   🎯 Priority: ${priority}`);
                        console.log(`   👤 Assigned To: ${assignedTo}`);
                        console.log(`   📅 Created: ${new Date(fields['System.CreatedDate']).toLocaleDateString()}`);
                        console.log(`   🔗 Link: https://dev.azure.com/${organization}/${project}/_workitems/edit/${workItem.id}`);
                        
                        // Show parent-child relationships
                        if (workItem.relations) {
                            const parents = workItem.relations.filter(r => r.rel === 'System.LinkTypes.Hierarchy-Reverse');
                            const children = workItem.relations.filter(r => r.rel === 'System.LinkTypes.Hierarchy-Forward');
                            
                            if (parents.length > 0) {
                                const parentIds = parents.map(p => p.url.split('/').pop()).join(', ');
                                console.log(`   👆 Parent(s): Work item(s) ${parentIds}`);
                            }
                            if (children.length > 0) {
                                const childIds = children.map(c => c.url.split('/').pop()).join(', ');
                                console.log(`   👇 Children: ${children.length} child item(s) (${childIds})`);
                            }
                        }
                        
                        // Show description preview
                        if (fields['System.Description']) {
                            const description = fields['System.Description']
                                .replace(/<[^>]*>/g, '') // Remove HTML tags
                                .replace(/\s+/g, ' ')     // Normalize whitespace
                                .trim();
                            const shortDesc = description.length > 150 
                                ? description.substring(0, 150) + '...' 
                                : description;
                            console.log(`   📝 Description: ${shortDesc}`);
                        }
                        
                        totalItems++;
                    });
                }
            });
            
            // Show any remaining types not in the hierarchy
            Object.keys(workItemsByType).forEach(type => {
                if (!typeOrder.includes(type)) {
                    console.log(`\n🔧 ${type.toUpperCase()}S (${workItemsByType[type].length}):`);
                    workItemsByType[type].forEach((workItem, index) => {
                        const fields = workItem.fields;
                        console.log(`${index + 1}. [ID: ${workItem.id}] ${fields['System.Title']} (${fields['System.State']})`);
                        totalItems++;
                    });
                }
            });
            
            console.log('\n' + '═'.repeat(120));
            console.log(`\n✅ PROJECT SUMMARY:`);
            console.log(`   📊 Total Work Items: ${totalItems}`);
            if (totalStoryPoints > 0) {
                console.log(`   📈 Total Story Points: ${totalStoryPoints}`);
            }
            
            // Show breakdown by type
            console.log(`\n📋 Work Item Type Breakdown:`);
            Object.keys(workItemsByType).forEach(type => {
                const count = workItemsByType[type].length;
                const typePoints = workItemsByType[type].reduce((sum, item) => {
                    return sum + (item.fields['Microsoft.VSTS.Scheduling.StoryPoints'] || 0);
                }, 0);
                
                if (typePoints > 0) {
                    console.log(`   • ${type}: ${count} items (${typePoints} story points)`);
                } else {
                    console.log(`   • ${type}: ${count} items`);
                }
            });
            
            // Show hierarchy validation
            console.log(`\n🔗 Hierarchy Validation:`);
            const epics = workItemsByType['Epic'] || [];
            const features = workItemsByType['Feature'] || [];
            epics.forEach(epic => {
                const epicFeatures = features.filter(f => 
                    f.relations && f.relations.some(r => 
                        r.rel === 'System.LinkTypes.Hierarchy-Reverse' && 
                        r.url.endsWith(`/${epic.id}`)
                    )
                );
                console.log(`   • Epic #${epic.id}: ${epicFeatures.length} Features linked`);
            });
            
        } else {
            console.log('📭 No work items found in the project.');
        }
        
    } catch (error) {
        console.error('❌ Failed to retrieve work items:');
        
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
listAllWorkItems().then(() => {
    console.log('\n🏁 Query complete.');
});

module.exports = { listAllWorkItems };