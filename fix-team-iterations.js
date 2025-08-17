#!/usr/bin/env node
// Fix team iteration assignment and work item assignments programmatically

const axios = require('axios');
require('dotenv').config();

class TeamIterationFixer {
    constructor() {
        this.organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
        this.project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
        this.pat = process.env.AZURE_DEVOPS_PAT;
        
        if (!this.pat) {
            throw new Error('AZURE_DEVOPS_PAT environment variable is required');
        }
        
        this.auth = Buffer.from(`:${this.pat}`).toString('base64');
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get team ID
    async getTeamId() {
        const url = `https://dev.azure.com/${this.organization}/_apis/projects/${this.project}/teams?api-version=7.1-preview.3`;
        
        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Basic ${this.auth}` }
            });
            
            const team = response.data.value[0]; // Get first/default team
            console.log(`✅ Found team: ${team.name} (${team.id})`);
            return team;
        } catch (error) {
            throw new Error(`Failed to get team: ${error.message}`);
        }
    }

    // Get existing team iterations to see what's already configured
    async getTeamIterations(teamId) {
        const url = `https://dev.azure.com/${this.organization}/${this.project}/${teamId}/_apis/work/teamsettings/iterations?api-version=7.1-preview.1`;
        
        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Basic ${this.auth}` }
            });
            
            const iterations = response.data.value || [];
            console.log(`📋 Team currently has ${iterations.length} configured iterations:`);
            iterations.forEach(iter => {
                console.log(`   • ${iter.name} (${iter.path})`);
            });
            
            return iterations;
        } catch (error) {
            console.log(`⚠️ Could not get team iterations: ${error.message}`);
            return [];
        }
    }

    // Add iteration to team configuration using the correct API pattern
    async addIterationToTeam(teamId, iteration) {
        const url = `https://dev.azure.com/${this.organization}/${this.project}/${teamId}/_apis/work/teamsettings/iterations?api-version=7.1-preview.1`;
        
        // Use the correct payload format for adding iterations to team
        const payload = {
            id: iteration.id,
            name: iteration.name,
            path: iteration.path,
            attributes: iteration.attributes || {}
        };
        
        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return {
                success: true,
                iteration: iteration.name,
                response: response.data
            };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            
            // Check if it's already configured
            if (errorMsg.includes('already exists') || errorMsg.includes('already added') || 
                errorMsg.includes('TF401249') || error.response?.status === 409) {
                return {
                    success: true,
                    iteration: iteration.name,
                    alreadyExists: true
                };
            }
            
            return {
                success: false,
                iteration: iteration.name,
                error: errorMsg
            };
        }
    }

    // Assign work item to sprint using correct iteration path
    async assignWorkItemToSprint(workItemId, iterationPath, sprintName) {
        const url = `https://dev.azure.com/${this.organization}/${this.project}/_apis/wit/workitems/${workItemId}?api-version=7.1-preview.3`;
        
        const operations = [
            {
                op: 'add',
                path: '/fields/System.IterationPath',
                value: iterationPath
            }
        ];
        
        try {
            const response = await axios.patch(url, operations, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json-patch+json'
                }
            });
            
            return {
                success: true,
                workItemId,
                title: response.data.fields['System.Title'],
                iterationPath: response.data.fields['System.IterationPath'],
                sprintName
            };
        } catch (error) {
            return {
                success: false,
                workItemId,
                error: error.response?.data?.message || error.message,
                sprintName
            };
        }
    }

    // Main execution method
    async fixTeamConfiguration() {
        console.log('🔧 Fixing Team Iteration Configuration...\n');
        
        try {
            // Step 1: Get team
            console.log('📋 Step 1: Getting team information...');
            const team = await this.getTeamId();
            
            // Step 2: Get existing team iterations
            console.log('\n📋 Step 2: Checking current team iterations...');
            const existingIterations = await this.getTeamIterations(team.id);
            
            // Step 3: Get all available iterations
            console.log('\n📋 Step 3: Getting all project iterations...');
            const allIterationsUrl = `https://dev.azure.com/${this.organization}/${this.project}/_apis/wit/classificationnodes/iterations?api-version=7.1-preview.2&$depth=2`;
            
            const iterationsResponse = await axios.get(allIterationsUrl, {
                headers: { 'Authorization': `Basic ${this.auth}` }
            });
            
            const allIterations = iterationsResponse.data.children || [];
            console.log(`📋 Found ${allIterations.length} total project iterations`);
            
            // Step 4: Add MVP sprints to team configuration
            console.log('\n📋 Step 4: Adding MVP sprints to team configuration...');
            
            const mvpSprints = [
                'MVP-Planning-Sprint',
                'Sprint-1-2-Event-Creation', 
                'Sprint-3-Event-Search',
                'Sprint-4-Event-Filtering',
                'MVP-Launch-Sprint',
                'Sprint-5-MVP-Enhancement',
                'Post-MVP-Backlog'
            ];
            
            const addResults = [];
            
            for (const sprintName of mvpSprints) {
                const iteration = allIterations.find(iter => iter.name === sprintName);
                
                if (!iteration) {
                    console.log(`❌ Sprint not found: ${sprintName}`);
                    continue;
                }
                
                console.log(`🔄 Adding ${sprintName} to team...`);
                const result = await this.addIterationToTeam(team.id, iteration);
                addResults.push(result);
                
                if (result.success) {
                    if (result.alreadyExists) {
                        console.log(`⚠️ Already configured: ${sprintName}`);
                    } else {
                        console.log(`✅ Added: ${sprintName}`);
                    }
                } else {
                    console.log(`❌ Failed to add ${sprintName}: ${result.error}`);
                }
                
                await this.sleep(300);
            }
            
            // Step 5: Now assign work items to sprints
            console.log('\n📋 Step 5: Assigning work items to sprints...');
            
            const workItemAssignments = [
                { workItemId: 15, sprintName: 'Sprint-1-2-Event-Creation' },
                { workItemId: 19, sprintName: 'Sprint-3-Event-Search' },
                { workItemId: 20, sprintName: 'Sprint-4-Event-Filtering' },
                { workItemId: 16, sprintName: 'Sprint-5-MVP-Enhancement' },
                { workItemId: 17, sprintName: 'Post-MVP-Backlog' },
                { workItemId: 18, sprintName: 'Post-MVP-Backlog' },
                { workItemId: 21, sprintName: 'Post-MVP-Backlog' }
            ];
            
            const assignmentResults = [];
            
            for (const assignment of workItemAssignments) {
                const iteration = allIterations.find(iter => iter.name === assignment.sprintName);
                
                if (!iteration) {
                    console.log(`❌ Sprint not found for assignment: ${assignment.sprintName}`);
                    continue;
                }
                
                console.log(`🔄 Assigning US#${assignment.workItemId} to ${assignment.sprintName}...`);
                
                const result = await this.assignWorkItemToSprint(
                    assignment.workItemId,
                    iteration.path,
                    assignment.sprintName
                );
                
                assignmentResults.push(result);
                
                if (result.success) {
                    console.log(`✅ US#${assignment.workItemId}: ${result.title} → ${assignment.sprintName}`);
                } else {
                    console.log(`❌ US#${assignment.workItemId}: ${result.error}`);
                }
                
                await this.sleep(300);
            }
            
            // Generate summary
            this.generateSummary(addResults, assignmentResults);
            
            return {
                teamConfigured: team.name,
                iterationsAdded: addResults.filter(r => r.success).length,
                workItemsAssigned: assignmentResults.filter(r => r.success).length,
                totalAssignments: assignmentResults.length
            };
            
        } catch (error) {
            console.error('\n💥 Team configuration failed:', error.message);
            throw error;
        }
    }

    generateSummary(addResults, assignmentResults) {
        console.log('\n' + '═'.repeat(80));
        console.log('📊 TEAM CONFIGURATION SUMMARY');
        console.log('═'.repeat(80));
        
        const successfulAdds = addResults.filter(r => r.success);
        const successfulAssignments = assignmentResults.filter(r => r.success);
        
        console.log(`✅ Team iterations configured: ${successfulAdds.length}/${addResults.length}`);
        console.log(`✅ Work items assigned: ${successfulAssignments.length}/${assignmentResults.length}`);
        
        if (successfulAssignments.length > 0) {
            console.log('\n🎯 SUCCESSFUL WORK ITEM ASSIGNMENTS:');
            successfulAssignments.forEach(result => {
                console.log(`   ✅ US#${result.workItemId}: ${result.sprintName}`);
            });
        }
        
        const failedAssignments = assignmentResults.filter(r => !r.success);
        if (failedAssignments.length > 0) {
            console.log('\n❌ FAILED ASSIGNMENTS:');
            failedAssignments.forEach(result => {
                console.log(`   • US#${result.workItemId}: ${result.error}`);
            });
        }
        
        if (successfulAdds.length === addResults.length && 
            successfulAssignments.length === assignmentResults.length) {
            console.log('\n🎉 COMPLETE SUCCESS!');
            console.log('✅ All MVP sprints configured for team');
            console.log('✅ All work items assigned to correct sprints');
            console.log('\n🎪 NOW CHECK AZURE DEVOPS:');
            console.log('   • Go to Boards → Sprints');
            console.log('   • You should see all 7 MVP sprints with work items');
            console.log('   • Sprint planning view should be fully functional');
            console.log('   • Burndown charts and velocity tracking ready');
        } else {
            console.log('\n⚠️ PARTIAL SUCCESS - some items need manual review');
        }
    }
}

// Execute if run directly
if (require.main === module) {
    const fixer = new TeamIterationFixer();
    fixer.fixTeamConfiguration()
        .then((summary) => {
            console.log(`\n🏁 Team configuration complete!`);
            console.log(`   👥 Team: ${summary.teamConfigured}`);
            console.log(`   📅 Iterations: ${summary.iterationsAdded} configured`);
            console.log(`   🔗 Assignments: ${summary.workItemsAssigned}/${summary.totalAssignments} successful`);
            
            if (summary.workItemsAssigned === summary.totalAssignments) {
                console.log('\n🎊 SUCCESS! Sprint planning is now fully functional in Azure DevOps!');
            }
        })
        .catch((error) => {
            console.error('💥 Configuration failed:', error.message);
            process.exit(1);
        });
}

module.exports = TeamIterationFixer;