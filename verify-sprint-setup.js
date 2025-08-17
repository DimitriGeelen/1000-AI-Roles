#!/usr/bin/env node
// Verify sprint planning setup once manually configured

const axios = require('axios');
require('dotenv').config();

async function verifySprintSetup() {
    const organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
    const project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
    const pat = process.env.AZURE_DEVOPS_PAT;
    const auth = Buffer.from(`:${pat}`).toString('base64');
    
    console.log('🔍 Verifying Sprint Planning Setup...\n');
    
    // Check work items and their iteration assignments
    const userStoryIds = [15, 16, 17, 18, 19, 20, 21];
    const expectedAssignments = {
        15: 'Sprint 1-2: Event Creation',
        19: 'Sprint 3: Event Search', 
        20: 'Sprint 4: Event Filtering',
        16: 'Sprint 5: MVP Enhancement',
        17: 'Post-MVP Backlog',
        18: 'Post-MVP Backlog',
        21: 'Post-MVP Backlog'
    };
    
    console.log('📋 Checking User Story Sprint Assignments...\n');
    
    const results = [];
    
    for (const id of userStoryIds) {
        try {
            const url = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/${id}?api-version=7.1-preview.3`;
            
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Accept': 'application/json'
                }
            });
            
            const workItem = response.data;
            const title = workItem.fields['System.Title'];
            const iterationPath = workItem.fields['System.IterationPath'] || 'Not Assigned';
            const priority = workItem.fields['Microsoft.VSTS.Common.Priority'] || 'No Priority';
            const tags = workItem.fields['System.Tags'] || 'No Tags';
            
            const expectedSprint = expectedAssignments[id];
            const correctlyAssigned = iterationPath.includes(expectedSprint) || iterationPath === expectedSprint;
            
            console.log(`📋 US#${id}: ${title}`);
            console.log(`   🎯 Priority: ${priority}`);
            console.log(`   📅 Iteration: ${iterationPath}`);
            console.log(`   ✅ Expected: ${expectedSprint}`);
            console.log(`   ${correctlyAssigned ? '✅' : '❌'} Assignment: ${correctlyAssigned ? 'CORRECT' : 'NEEDS UPDATE'}`);
            console.log(`   🏷️ Tags: ${tags.split(';').slice(0, 3).join('; ')}...`);
            console.log('');
            
            results.push({
                id,
                title,
                iterationPath,
                expectedSprint,
                correctlyAssigned,
                priority
            });
            
        } catch (error) {
            console.log(`❌ US#${id}: Error - ${error.message}\n`);
        }
    }
    
    // Summary
    console.log('═'.repeat(80));
    console.log('📊 SPRINT PLANNING VERIFICATION SUMMARY');
    console.log('═'.repeat(80));
    
    const correctAssignments = results.filter(r => r.correctlyAssigned);
    const basicVersionItems = results.filter(r => [15, 19, 20].includes(r.id));
    const mvpEnhancementItems = results.filter(r => r.id === 16);
    const postMVPItems = results.filter(r => [17, 18, 21].includes(r.id));
    
    console.log(`✅ Correctly Assigned: ${correctAssignments.length}/${results.length} User Stories`);
    console.log(`❌ Need Assignment: ${results.length - correctAssignments.length}/${results.length} User Stories`);
    
    console.log('\n🎯 SPRINT BREAKDOWN:');
    
    if (basicVersionItems.length > 0) {
        console.log('\n📱 BASIC VERSION (Priority 1) - Launch May 2025:');
        basicVersionItems.forEach(item => {
            const status = item.correctlyAssigned ? '✅' : '❌';
            console.log(`   ${status} US#${item.id}: ${item.expectedSprint}`);
        });
    }
    
    if (mvpEnhancementItems.length > 0) {
        console.log('\n🚀 MVP ENHANCEMENT (Priority 2):');
        mvpEnhancementItems.forEach(item => {
            const status = item.correctlyAssigned ? '✅' : '❌';
            console.log(`   ${status} US#${item.id}: ${item.expectedSprint}`);
        });
    }
    
    if (postMVPItems.length > 0) {
        console.log('\n📋 POST-MVP (Priority 3) - Future:');
        postMVPItems.forEach(item => {
            const status = item.correctlyAssigned ? '✅' : '❌';
            console.log(`   ${status} US#${item.id}: ${item.expectedSprint}`);
        });
    }
    
    if (correctAssignments.length === results.length) {
        console.log('\n🎉 PERFECT! All User Stories correctly assigned to sprints!');
        console.log('✅ Sprint planning structure is complete');
        console.log('✅ Ready for development with proper milestone tracking');
    } else {
        console.log('\n⚠️ ACTION REQUIRED:');
        console.log('1. Create missing iteration paths in Project Settings → Iterations');
        console.log('2. Assign User Stories to correct sprints');
        console.log('3. Re-run this verification script');
    }
    
    console.log('\n🎪 AZURE DEVOPS BOARDS READY FOR:');
    console.log('   • Sprint planning meetings');
    console.log('   • Kanban boards by sprint');
    console.log('   • Velocity tracking');
    console.log('   • Burndown charts');
    console.log('   • Milestone progress tracking');
    
    return results;
}

verifySprintSetup();