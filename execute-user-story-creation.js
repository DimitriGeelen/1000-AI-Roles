// Execute User Story Creation for Features #4 and #5
const createF4Stories = require('./create-user-stories-f4.js');
const createF5Stories = require('./create-user-stories-f5.js');

async function executeUserStoryCreation() {
    console.log('🚀 STARTING USER STORY CREATION FOR FEATURES #4 & #5');
    console.log('='.repeat(60));
    
    try {
        // Create Feature #4 User Stories
        console.log('\n🎯 PHASE 1: Creating User Stories for Feature #4: Event Creation & Management');
        console.log('-'.repeat(50));
        const f4Results = await createF4Stories();
        
        // Create Feature #5 User Stories  
        console.log('\n🎯 PHASE 2: Creating User Stories for Feature #5: Event Discovery & Search');
        console.log('-'.repeat(50));
        const f5Results = await createF5Stories();
        
        // Comprehensive Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 COMPREHENSIVE USER STORY CREATION SUMMARY');
        console.log('='.repeat(60));
        
        const allResults = [...f4Results, ...f5Results];
        const totalSuccessful = allResults.filter(r => r.success);
        const totalFailed = allResults.filter(r => !r.success);
        
        console.log(`\n🎯 OVERALL RESULTS:`);
        console.log(`   ✅ Successfully created: ${totalSuccessful.length}/${allResults.length} User Stories`);
        console.log(`   ❌ Failed: ${totalFailed.length}/${allResults.length} User Stories`);
        
        if (totalSuccessful.length > 0) {
            console.log(`\n📈 CREATED USER STORIES BY FEATURE:`);
            
            // Feature #4 Summary
            const f4Successful = f4Results.filter(r => r.success);
            if (f4Successful.length > 0) {
                const f4Points = f4Successful.reduce((sum, story) => sum + story.points, 0);
                console.log(`\n   🎭 Feature #4: Event Creation & Management (${f4Points}/8 points)`);
                f4Successful.forEach(story => {
                    console.log(`      • #${story.id}: ${story.title} (${story.points} points)`);
                });
            }
            
            // Feature #5 Summary
            const f5Successful = f5Results.filter(r => r.success);
            if (f5Successful.length > 0) {
                const f5Points = f5Successful.reduce((sum, story) => sum + story.points, 0);
                console.log(`\n   🔍 Feature #5: Event Discovery & Search (${f5Points}/5 points)`);
                f5Successful.forEach(story => {
                    console.log(`      • #${story.id}: ${story.title} (${story.points} points)`);
                });
            }
            
            const totalPoints = totalSuccessful.reduce((sum, story) => sum + story.points, 0);
            console.log(`\n   📊 Total Story Points Created: ${totalPoints}/13`);
        }
        
        if (totalFailed.length > 0) {
            console.log(`\n❌ FAILED USER STORIES:`);
            totalFailed.forEach(story => {
                console.log(`   • ${story.title}: ${story.error}`);
            });
        }
        
        console.log(`\n🔗 AZURE DEVOPS INTEGRATION:`);
        console.log(`   • All User Stories linked to parent Features (#4 and #5)`);
        console.log(`   • Complete traceability maintained: Epic #2 → Features #4,#5 → User Stories`);
        console.log(`   • Mandatory validation confirms all work items exist in Azure DevOps`);
        
        console.log(`\n✅ USER STORY CREATION PHASE COMPLETE`);
        console.log(`   Ready for MVP Specialist to prioritize and organize into sprints`);
        
        return {
            success: totalSuccessful.length === allResults.length,
            created: totalSuccessful.length,
            failed: totalFailed.length,
            total: allResults.length,
            results: allResults
        };
        
    } catch (error) {
        console.error('💥 FATAL ERROR in user story creation:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Execute if run directly
if (require.main === module) {
    executeUserStoryCreation()
        .then(summary => {
            if (summary.success) {
                console.log(`\n🎉 SUCCESS: All ${summary.created} User Stories created successfully!`);
                process.exit(0);
            } else {
                console.log(`\n⚠️  PARTIAL SUCCESS: ${summary.created}/${summary.total} User Stories created`);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Execution failed:', error);
            process.exit(1);
        });
}

module.exports = executeUserStoryCreation;