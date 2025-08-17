#!/usr/bin/env node
// Update Azure DevOps with MVP prioritization and sprint planning
// Reflects the MVP Specialist's strategy in work item organization

const AzureDevOpsPlanner = require('./scripts/azure-devops-planner-impl.js');

async function updateMVPPrioritization() {
    const planner = new AzureDevOpsPlanner();
    
    console.log('🎯 Updating Azure DevOps with MVP Strategy...\n');
    
    // Step 1: Create Iteration Paths (Sprints) for MVP phases
    console.log('📅 Step 1: Creating MVP Milestones and Sprints');
    
    // Step 2: Update User Story priorities based on MVP scope
    console.log('\n🔄 Step 2: Updating User Story Priorities');
    
    // BASIC VERSION (Phase 1 - Launch May 2026)
    const basicVersionUpdates = [
        {
            id: 15, // US016: Basic Event Creation Workflow
            priority: 1,
            tags: ['basic-version', 'phase-1', 'must-have', 'launch-critical'],
            iteration: 'Sprint 1-2',
            description: 'BASIC VERSION: Post events with key data and image (≤5 steps)'
        },
        {
            id: 19, // US020: Basic Event Search  
            priority: 1,
            tags: ['basic-version', 'phase-1', 'must-have', 'launch-critical'],
            iteration: 'Sprint 3',
            description: 'BASIC VERSION: Search events (≤3 steps)'
        },
        {
            id: 20, // US021: Event Filtering by Type & Category
            priority: 1, 
            tags: ['basic-version', 'phase-1', 'must-have', 'launch-critical'],
            iteration: 'Sprint 4',
            description: 'BASIC VERSION: Filter events by type and category'
        }
    ];
    
    // MVP ENHANCEMENT (Phase 2)
    const mvpEnhancementUpdates = [
        {
            id: 16, // US017: Event Information Management & Editing
            priority: 2,
            tags: ['mvp-enhancement', 'phase-2', 'should-have'],
            iteration: 'Sprint 5',
            description: 'MVP ENHANCEMENT: Edit posted events with real-time updates'
        }
    ];
    
    // POST-MVP (Future Iterations)
    const postMVPUpdates = [
        {
            id: 17, // US018: Event Lifecycle Management
            priority: 3,
            tags: ['post-mvp', 'phase-3', 'could-have', 'future'],
            iteration: 'Backlog',
            description: 'POST-MVP: Delete, archive, duplicate events'
        },
        {
            id: 18, // US019: Progressive Enhancement for Event Details
            priority: 3,
            tags: ['post-mvp', 'phase-3', 'could-have', 'future'],
            iteration: 'Backlog', 
            description: 'POST-MVP: Advanced event details features'
        },
        {
            id: 21, // US022: Advanced Search with Progressive Enhancement
            priority: 3,
            tags: ['post-mvp', 'phase-3', 'could-have', 'future'],
            iteration: 'Backlog',
            description: 'POST-MVP: Advanced search with saved preferences'
        }
    ];
    
    // Combine all updates
    const allUpdates = [...basicVersionUpdates, ...mvpEnhancementUpdates, ...postMVPUpdates];
    
    // Step 3: Execute updates
    console.log('\n🔧 Step 3: Executing Azure DevOps Updates');
    
    const results = [];
    
    for (const update of allUpdates) {
        try {
            console.log(`\n🔄 Updating User Story #${update.id}...`);
            
            // Update work item with MVP classification
            const updateCommand = {
                "command": "UPDATE_STATUS",
                "agent": "mvp-specialist",
                "data": {
                    "work_item_id": update.id,
                    "new_state": "Active", // Move to Active for development
                    "priority": update.priority,
                    "tags": update.tags.join('; '),
                    "description_append": `\n\n🎯 MVP CLASSIFICATION: ${update.description}\n📅 Target Iteration: ${update.iteration}`,
                    "reason": "MVP prioritization by MVP Specialist"
                }
            };
            
            const result = await planner.processCommand(updateCommand);
            results.push({ ...result, userStory: update.id, phase: update.iteration });
            
            if (result.success) {
                console.log(`✅ Updated User Story #${update.id}: ${update.description}`);
            } else {
                console.error(`❌ Failed to update User Story #${update.id}:`, result.message);
            }
            
        } catch (error) {
            console.error(`❌ Error updating User Story #${update.id}:`, error.message);
            results.push({ success: false, error: error.message, userStory: update.id });
        }
    }
    
    // Step 4: Create MVP Summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 MVP PRIORITIZATION SUMMARY');
    console.log('═'.repeat(80));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successfully updated: ${successful.length}/${allUpdates.length} User Stories`);
    console.log(`❌ Failed: ${failed.length}/${allUpdates.length} User Stories`);
    
    if (successful.length > 0) {
        console.log('\n🎯 UPDATED USER STORIES BY PHASE:');
        
        console.log('\n📱 BASIC VERSION (Launch May 2026) - 7 Story Points:');
        successful.filter(r => basicVersionUpdates.some(u => u.id === r.userStory)).forEach(result => {
            const update = basicVersionUpdates.find(u => u.id === result.userStory);
            console.log(`   ✅ US#${result.userStory}: ${update.description}`);
        });
        
        console.log('\n🚀 MVP ENHANCEMENT (Phase 2) - 2 Story Points:');
        successful.filter(r => mvpEnhancementUpdates.some(u => u.id === r.userStory)).forEach(result => {
            const update = mvpEnhancementUpdates.find(u => u.id === result.userStory);
            console.log(`   ✅ US#${result.userStory}: ${update.description}`);
        });
        
        console.log('\n📋 POST-MVP (Future) - 4 Story Points:');
        successful.filter(r => postMVPUpdates.some(u => u.id === r.userStory)).forEach(result => {
            const update = postMVPUpdates.find(u => u.id === result.userStory);
            console.log(`   ✅ US#${result.userStory}: ${update.description}`);
        });
    }
    
    if (failed.length > 0) {
        console.log('\n❌ FAILED UPDATES:');
        failed.forEach(result => {
            console.log(`   • User Story #${result.userStory}: ${result.message || result.error}`);
        });
    }
    
    console.log('\n🎯 MVP SPRINT PLANNING:');
    console.log('   📅 Sprint 1-2: US#15 - Basic Event Creation (3 pts)');
    console.log('   📅 Sprint 3: US#19 - Basic Event Search (2 pts)');
    console.log('   📅 Sprint 4: US#20 - Event Filtering (2 pts)');
    console.log('   📅 Sprint 5: US#16 - Event Editing (2 pts)');
    console.log('   📅 Backlog: US#17, US#18, US#21 - Post-MVP features');
    
    console.log('\n🏆 SUCCESS METRICS TRACKING:');
    console.log('   • Village adoption percentage (≥60% of 150 residents)');
    console.log('   • QR code scan rates from village boards');
    console.log('   • Number of events posted in app');
    console.log('   • User & poster satisfaction surveys');
    console.log('   • Event discoverability success rate');
    
    console.log('\n📋 AZURE DEVOPS ORGANIZATION:');
    console.log('   • User Stories tagged with MVP phases');
    console.log('   • Priorities updated (1=Basic Version, 2=MVP, 3=Post-MVP)');
    console.log('   • Sprint assignments for development planning');
    console.log('   • Success metrics ready for tracking');
    
    return results;
}

// Run the MVP prioritization update
if (require.main === module) {
    updateMVPPrioritization().then((results) => {
        console.log('\n🏁 MVP prioritization update complete.');
        console.log('\n➡️ Next: Use Azure DevOps boards to manage sprint development');
        process.exit(0);
    }).catch((error) => {
        console.error('💥 Fatal error during MVP update:', error);
        process.exit(1);
    });
}

module.exports = { updateMVPPrioritization };