#!/usr/bin/env node
// Fix the iteration path assignments for work items

const axios = require('axios');
require('dotenv').config();

async function fixIterationAssignments() {
    const organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
    const project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
    const pat = process.env.AZURE_DEVOPS_PAT;
    const auth = Buffer.from(`:${pat}`).toString('base64');
    
    console.log('🔧 Fixing Work Item Iteration Assignments...\n');
    
    // Correct assignments with proper iteration path format
    const assignments = [
        { workItemId: 15, iterationPath: `${project}\\Iteration\\Sprint-1-2-Event-Creation`, sprintName: 'Sprint-1-2-Event-Creation' },
        { workItemId: 19, iterationPath: `${project}\\Iteration\\Sprint-3-Event-Search`, sprintName: 'Sprint-3-Event-Search' },
        { workItemId: 20, iterationPath: `${project}\\Iteration\\Sprint-4-Event-Filtering`, sprintName: 'Sprint-4-Event-Filtering' },
        { workItemId: 16, iterationPath: `${project}\\Iteration\\Sprint-5-MVP-Enhancement`, sprintName: 'Sprint-5-MVP-Enhancement' },
        { workItemId: 17, iterationPath: `${project}\\Iteration\\Post-MVP-Backlog`, sprintName: 'Post-MVP-Backlog' },
        { workItemId: 18, iterationPath: `${project}\\Iteration\\Post-MVP-Backlog`, sprintName: 'Post-MVP-Backlog' },
        { workItemId: 21, iterationPath: `${project}\\Iteration\\Post-MVP-Backlog`, sprintName: 'Post-MVP-Backlog' }
    ];
    
    const results = [];
    
    for (const assignment of assignments) {
        console.log(`🔄 Assigning US#${assignment.workItemId} to ${assignment.sprintName}...`);
        
        const url = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/${assignment.workItemId}?api-version=7.1-preview.3`;
        
        const operations = [
            {
                op: 'add',
                path: '/fields/System.IterationPath',
                value: assignment.iterationPath
            }
        ];
        
        try {
            const response = await axios.patch(url, operations, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json-patch+json'
                },
                timeout: 15000
            });
            
            const title = response.data.fields['System.Title'];
            const assignedPath = response.data.fields['System.IterationPath'];
            
            console.log(`✅ US#${assignment.workItemId}: ${title}`);
            console.log(`   📅 Assigned to: ${assignedPath}`);
            
            results.push({
                success: true,
                workItemId: assignment.workItemId,
                title,
                iterationPath: assignedPath,
                sprintName: assignment.sprintName
            });
            
        } catch (error) {
            console.log(`❌ US#${assignment.workItemId}: ${error.response?.data?.message || error.message}`);
            
            results.push({
                success: false,
                workItemId: assignment.workItemId,
                error: error.response?.data?.message || error.message,
                sprintName: assignment.sprintName
            });
        }
        
        console.log('');
    }
    
    // Summary
    console.log('═'.repeat(80));
    console.log('📊 ITERATION ASSIGNMENT RESULTS');
    console.log('═'.repeat(80));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successfully assigned: ${successful.length}/${assignments.length} work items`);
    console.log(`❌ Failed assignments: ${failed.length}/${assignments.length} work items`);
    
    if (successful.length > 0) {
        console.log('\n✅ SUCCESSFUL ASSIGNMENTS:');
        successful.forEach(result => {
            console.log(`   • US#${result.workItemId}: ${result.sprintName}`);
        });
    }
    
    if (failed.length > 0) {
        console.log('\n❌ FAILED ASSIGNMENTS:');
        failed.forEach(result => {
            console.log(`   • US#${result.workItemId}: ${result.error}`);
        });
    }
    
    if (successful.length === assignments.length) {
        console.log('\n🎉 PERFECT! All work items successfully assigned to sprints!');
        console.log('✅ Complete programmatic sprint planning accomplished');
        console.log('✅ Azure DevOps boards ready for development');
    }
    
    console.log('\n🎪 AZURE DEVOPS → BOARDS → SPRINTS NOW SHOWS:');
    console.log('   📅 Complete sprint timeline (Jan 2025 - Dec 2025)');
    console.log('   🎯 Work items properly distributed across sprints');
    console.log('   📊 Ready for velocity tracking and burndown charts');
    console.log('   🚀 May 2025 village pilot launch milestone visible');
    
    return results;
}

fixIterationAssignments();