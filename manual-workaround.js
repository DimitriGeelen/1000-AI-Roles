#!/usr/bin/env node
// Manual workaround - provide the exact steps for the user to complete the setup

const axios = require('axios');
require('dotenv').config();

async function provideManualInstructions() {
    const organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
    const project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
    
    console.log('🎯 MANUAL SPRINT SETUP INSTRUCTIONS');
    console.log('===================================\n');
    
    console.log('The programmatic approach is hitting Azure DevOps API limitations.');
    console.log('Here are the exact manual steps to complete the sprint setup:\n');
    
    console.log('📋 STEP 1: Configure Team Iterations');
    console.log('=====================================');
    console.log(`1. Go to: https://dev.azure.com/${organization}/${project}/_settings/work`);
    console.log('2. Click on "fnb-pricing Team" (or your team name)');
    console.log('3. Click on "Iterations and areas"');
    console.log('4. Click "Select iterations"');
    console.log('5. Check these iterations to add them to your team:');
    console.log('   ☐ MVP-Planning-Sprint');
    console.log('   ☐ Sprint-1-2-Event-Creation');
    console.log('   ☐ Sprint-3-Event-Search');
    console.log('   ☐ Sprint-4-Event-Filtering');
    console.log('   ☐ MVP-Launch-Sprint');
    console.log('   ☐ Sprint-5-MVP-Enhancement');
    console.log('   ☐ Post-MVP-Backlog');
    console.log('6. Click "Save and close"\n');
    
    console.log('📋 STEP 2: Assign Work Items to Sprints');
    console.log('=======================================');
    console.log(`1. Go to: https://dev.azure.com/${organization}/${project}/_backlogs/backlog/fnb-pricing%20Team/Backlog%20items`);
    console.log('2. For each work item, edit the "Iteration" field:');
    console.log('');
    console.log('   📱 BASIC VERSION (Launch May 2025):');
    console.log('   • User Story #15 → Sprint-1-2-Event-Creation');
    console.log('   • User Story #19 → Sprint-3-Event-Search');
    console.log('   • User Story #20 → Sprint-4-Event-Filtering');
    console.log('');
    console.log('   🚀 MVP ENHANCEMENT:');
    console.log('   • User Story #16 → Sprint-5-MVP-Enhancement');
    console.log('');
    console.log('   📋 POST-MVP:');
    console.log('   • User Story #17 → Post-MVP-Backlog');
    console.log('   • User Story #18 → Post-MVP-Backlog');
    console.log('   • User Story #21 → Post-MVP-Backlog');
    console.log('');
    
    console.log('📋 STEP 3: Verify Sprint Boards');
    console.log('===============================');
    console.log(`1. Go to: https://dev.azure.com/${organization}/${project}/_sprints`);
    console.log('2. You should see all 7 MVP sprints in the dropdown');
    console.log('3. Each sprint should show its assigned work items');
    console.log('4. Sprint planning, burndown charts, and velocity tracking will be ready');
    console.log('');
    
    console.log('🎯 VERIFICATION CHECKLIST');
    console.log('=========================');
    console.log('After completing the manual steps, verify:');
    console.log('☐ All 7 sprints visible in sprint dropdown');
    console.log('☐ Work items appear in correct sprints');
    console.log('☐ Sprint timeline shows Jan 2025 - Dec 2025');
    console.log('☐ Burndown charts are available');
    console.log('☐ Velocity tracking is functional');
    console.log('☐ May 2025 launch milestone is visible');
    console.log('');
    
    console.log('🚀 ONCE COMPLETE:');
    console.log('=================');
    console.log('✅ Sprint planning infrastructure will be fully functional');
    console.log('✅ Development teams can use Azure DevOps boards');
    console.log('✅ MVP strategy properly reflected in sprint structure');
    console.log('✅ Ready for May 2025 village pilot launch planning');
    console.log('');
    
    console.log('💡 WHY MANUAL STEPS ARE NEEDED:');
    console.log('===============================');
    console.log('• Azure DevOps Team Settings API has specific permission requirements');
    console.log('• Classification node-to-team mapping requires interactive configuration');
    console.log('• The sprints exist and are properly created - just need team assignment');
    console.log('• This is a one-time setup that enables all future programmatic operations');
    
    // Verify sprints still exist
    console.log('\n🔍 FINAL VERIFICATION: Sprints Status');
    console.log('=====================================');
    
    try {
        const pat = process.env.AZURE_DEVOPS_PAT;
        const auth = Buffer.from(`:${pat}`).toString('base64');
        
        const url = `https://dev.azure.com/${organization}/${project}/_apis/wit/classificationnodes/iterations?api-version=7.1-preview.2&$depth=2`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        
        const iterations = response.data.children || [];
        const mvpSprints = [
            'MVP-Planning-Sprint', 'Sprint-1-2-Event-Creation', 'Sprint-3-Event-Search',
            'Sprint-4-Event-Filtering', 'MVP-Launch-Sprint', 'Sprint-5-MVP-Enhancement', 'Post-MVP-Backlog'
        ];
        
        let allFound = true;
        mvpSprints.forEach(sprintName => {
            const found = iterations.find(iter => iter.name === sprintName);
            if (found) {
                console.log(`✅ ${sprintName}: EXISTS`);
            } else {
                console.log(`❌ ${sprintName}: MISSING`);
                allFound = false;
            }
        });
        
        if (allFound) {
            console.log('\n🎉 ALL SPRINTS CONFIRMED TO EXIST!');
            console.log('The manual steps above will complete the sprint planning setup.');
        } else {
            console.log('\n🚨 SOME SPRINTS ARE MISSING!');
            console.log('You may need to re-run the sprint creation script first.');
        }
        
    } catch (error) {
        console.log(`\n⚠️ Could not verify sprints: ${error.message}`);
    }
}

provideManualInstructions();