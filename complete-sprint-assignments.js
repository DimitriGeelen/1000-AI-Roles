#!/usr/bin/env node
// Complete the sprint assignments by configuring team iterations and assigning work items

const axios = require('axios');
require('dotenv').config();

class CompleteSprintAssignments {
    constructor() {
        this.organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
        this.project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
        this.pat = process.env.AZURE_DEVOPS_PAT;
        
        if (!this.pat) {
            throw new Error('AZURE_DEVOPS_PAT environment variable is required');
        }
        
        this.auth = Buffer.from(`:${this.pat}`).toString('base64');
        this.baseUrl = `https://dev.azure.com/${this.organization}/${this.project}`;
        this.apiVersion = '7.1-preview.1';
    }

    // Step 1: Get team information
    async getTeamInfo() {
        const url = `https://dev.azure.com/${this.organization}/_apis/projects/${this.project}/teams?api-version=7.1-preview.3`;
        
        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Basic ${this.auth}` }
            });
            
            const teams = response.data.value;
            if (teams.length === 0) {
                throw new Error('No teams found in project');
            }
            
            // Use the first team (usually project default team)
            const team = teams[0];
            console.log(`✅ Found team: ${team.name} (ID: ${team.id})`);
            
            return team;
        } catch (error) {
            throw new Error(`Failed to get team info: ${error.message}`);
        }
    }

    // Step 2: Get available iterations (sprints we created)
    async getAvailableIterations() {
        const url = `${this.baseUrl}/_apis/wit/classificationnodes/iterations?api-version=7.1-preview.2&$depth=2`;
        
        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Basic ${this.auth}` }
            });
            
            const iterations = response.data.children || [];
            console.log(`✅ Found ${iterations.length} available iterations:`);
            iterations.forEach(iter => {
                console.log(`   • ${iter.name} (${iter.path})`);
            });
            
            return iterations;
        } catch (error) {
            throw new Error(`Failed to get iterations: ${error.message}`);
        }
    }

    // Step 3: Configure team iterations (equivalent to Project Settings → Team Configuration)
    async configureTeamIterations(team, iterations) {
        console.log('\n🔧 Configuring team iterations...');
        
        const teamIterationUrl = `https://dev.azure.com/${this.organization}/${this.project}/${team.id}/_apis/work/teamsettings/iterations?api-version=7.1-preview.1`;
        
        const results = [];
        
        for (const iteration of iterations) {
            try {
                console.log(`🔄 Adding iteration to team: ${iteration.name}`);
                
                const iterationData = {
                    id: iteration.id,
                    name: iteration.name,
                    path: iteration.path,
                    attributes: iteration.attributes || {}
                };
                
                const response = await axios.post(teamIterationUrl, iterationData, {
                    headers: {
                        'Authorization': `Basic ${this.auth}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log(`✅ Successfully added: ${iteration.name}`);
                results.push({
                    success: true,
                    iterationName: iteration.name,
                    iterationPath: iteration.path
                });
                
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message;
                
                if (errorMsg.includes('already exists') || errorMsg.includes('already configured')) {
                    console.log(`⚠️ Already configured: ${iteration.name}`);
                    results.push({
                        success: true,
                        iterationName: iteration.name,
                        iterationPath: iteration.path,
                        alreadyExists: true
                    });
                } else {
                    console.log(`❌ Failed to add ${iteration.name}: ${errorMsg}`);
                    results.push({
                        success: false,
                        iterationName: iteration.name,
                        error: errorMsg
                    });
                }
            }
            
            // Small delay between requests
            await this.sleep(500);
        }
        
        return results;
    }

    // Step 4: Assign work items to specific sprints with correct paths
    async assignWorkItemsToSprints(configuredIterations) {
        console.log('\n🔗 Assigning work items to sprints...');
        
        // Define the assignments based on MVP strategy
        const assignments = [
            { workItemId: 15, sprintName: 'Sprint-1-2-Event-Creation', mvpPhase: 'Basic Version' },
            { workItemId: 19, sprintName: 'Sprint-3-Event-Search', mvpPhase: 'Basic Version' },
            { workItemId: 20, sprintName: 'Sprint-4-Event-Filtering', mvpPhase: 'Basic Version' },
            { workItemId: 16, sprintName: 'Sprint-5-MVP-Enhancement', mvpPhase: 'MVP Enhancement' },
            { workItemId: 17, sprintName: 'Post-MVP-Backlog', mvpPhase: 'Post-MVP' },
            { workItemId: 18, sprintName: 'Post-MVP-Backlog', mvpPhase: 'Post-MVP' },
            { workItemId: 21, sprintName: 'Post-MVP-Backlog', mvpPhase: 'Post-MVP' }
        ];
        
        const results = [];
        
        for (const assignment of assignments) {
            try {
                console.log(`🔄 Assigning US#${assignment.workItemId} to ${assignment.sprintName}...`);
                
                // Find the configured iteration
                const targetIteration = configuredIterations.find(iter => 
                    iter.iterationName === assignment.sprintName && iter.success
                );
                
                if (!targetIteration) {
                    throw new Error(`Sprint ${assignment.sprintName} not found in configured iterations`);
                }
                
                const result = await this.assignWorkItemToIteration(
                    assignment.workItemId, 
                    targetIteration.iterationPath
                );
                
                results.push({
                    ...result,
                    mvpPhase: assignment.mvpPhase,
                    sprintName: assignment.sprintName
                });
                
                if (result.success) {
                    console.log(`✅ US#${assignment.workItemId}: ${result.title} → ${assignment.sprintName}`);
                } else {
                    console.log(`❌ US#${assignment.workItemId}: ${result.error}`);
                }
                
            } catch (error) {
                console.log(`❌ US#${assignment.workItemId}: ${error.message}`);
                results.push({
                    success: false,
                    workItemId: assignment.workItemId,
                    error: error.message,
                    mvpPhase: assignment.mvpPhase,
                    sprintName: assignment.sprintName
                });
            }
            
            // Small delay between assignments
            await this.sleep(300);
        }
        
        return results;
    }

    // Helper method to assign individual work item
    async assignWorkItemToIteration(workItemId, iterationPath) {
        const url = `${this.baseUrl}/_apis/wit/workitems/${workItemId}?api-version=7.1-preview.3`;
        
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
                iterationPath: response.data.fields['System.IterationPath']
            };
        } catch (error) {
            return {
                success: false,
                workItemId,
                error: error.response?.data?.message || error.message
            };
        }
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Main execution method
    async completeSprintSetup() {
        console.log('🚀 Completing Sprint Assignment Setup...\n');
        
        try {
            // Step 1: Get team information
            console.log('📋 Step 1: Getting team information...');
            const team = await this.getTeamInfo();
            
            // Step 2: Get available iterations
            console.log('\n📋 Step 2: Getting available iterations...');
            const iterations = await this.getAvailableIterations();
            
            if (iterations.length === 0) {
                throw new Error('No iterations found. Please run the sprint creation script first.');
            }
            
            // Step 3: Configure team iterations
            console.log('\n📋 Step 3: Configuring team iterations...');
            const configResults = await this.configureTeamIterations(team, iterations);
            
            const successfulConfigs = configResults.filter(r => r.success);
            console.log(`\n✅ Successfully configured ${successfulConfigs.length}/${iterations.length} iterations`);
            
            // Step 4: Assign work items to sprints
            console.log('\n📋 Step 4: Assigning work items to sprints...');
            const assignmentResults = await this.assignWorkItemsToSprints(successfulConfigs);
            
            // Generate final summary
            this.generateCompletionSummary(assignmentResults);
            
            return {
                teamConfigured: team.name,
                iterationsConfigured: successfulConfigs.length,
                workItemsAssigned: assignmentResults.filter(r => r.success).length,
                totalWorkItems: assignmentResults.length,
                results: assignmentResults
            };
            
        } catch (error) {
            console.error('\n💥 Sprint assignment setup failed:', error.message);
            throw error;
        }
    }

    generateCompletionSummary(assignmentResults) {
        console.log('\n' + '═'.repeat(80));
        console.log('📊 COMPLETE SPRINT ASSIGNMENT SUMMARY');
        console.log('═'.repeat(80));
        
        const successful = assignmentResults.filter(r => r.success);
        const failed = assignmentResults.filter(r => !r.success);
        
        console.log(`✅ Successfully assigned: ${successful.length}/${assignmentResults.length} work items`);
        console.log(`❌ Failed assignments: ${failed.length}/${assignmentResults.length} work items`);
        
        if (successful.length > 0) {
            console.log('\n🎯 SUCCESSFUL ASSIGNMENTS BY PHASE:');
            
            const basicVersion = successful.filter(r => r.mvpPhase === 'Basic Version');
            const mvpEnhancement = successful.filter(r => r.mvpPhase === 'MVP Enhancement');
            const postMVP = successful.filter(r => r.mvpPhase === 'Post-MVP');
            
            if (basicVersion.length > 0) {
                console.log('\n📱 BASIC VERSION (Launch May 2025):');
                basicVersion.forEach(r => {
                    console.log(`   ✅ US#${r.workItemId}: ${r.sprintName}`);
                });
            }
            
            if (mvpEnhancement.length > 0) {
                console.log('\n🚀 MVP ENHANCEMENT:');
                mvpEnhancement.forEach(r => {
                    console.log(`   ✅ US#${r.workItemId}: ${r.sprintName}`);
                });
            }
            
            if (postMVP.length > 0) {
                console.log('\n📋 POST-MVP:');
                postMVP.forEach(r => {
                    console.log(`   ✅ US#${r.workItemId}: ${r.sprintName}`);
                });
            }
        }
        
        if (failed.length > 0) {
            console.log('\n❌ FAILED ASSIGNMENTS:');
            failed.forEach(r => {
                console.log(`   • US#${r.workItemId}: ${r.error}`);
            });
        }
        
        if (successful.length === assignmentResults.length) {
            console.log('\n🎉 PERFECT! All work items successfully assigned to sprints!');
            console.log('✅ Complete programmatic sprint planning accomplished');
            console.log('✅ Azure DevOps boards ready for development');
            console.log('\n🎪 CHECK AZURE DEVOPS → BOARDS → SPRINTS:');
            console.log('   📅 Complete sprint timeline visible');
            console.log('   🎯 Work items distributed across sprints');
            console.log('   📊 Ready for velocity tracking and burndown charts');
            console.log('   🚀 May 2025 village pilot launch milestone visible');
        } else {
            console.log('\n⚠️ SOME ASSIGNMENTS FAILED:');
            console.log('   1. Check Azure DevOps team configuration');
            console.log('   2. Verify sprint iterations are properly created');
            console.log('   3. Re-run this script to retry failed assignments');
        }
    }
}

// Execute if run directly
if (require.main === module) {
    const assignmentSetup = new CompleteSprintAssignments();
    assignmentSetup.completeSprintSetup()
        .then((summary) => {
            console.log(`\n🏁 Sprint assignment setup complete!`);
            console.log(`   👥 Team: ${summary.teamConfigured}`);
            console.log(`   📅 Iterations: ${summary.iterationsConfigured} configured`);
            console.log(`   🔗 Assignments: ${summary.workItemsAssigned}/${summary.totalWorkItems} successful`);
            
            if (summary.workItemsAssigned === summary.totalWorkItems) {
                console.log('\n🎊 SUCCESS! Complete programmatic sprint planning achieved!');
            }
        })
        .catch((error) => {
            console.error('💥 Setup failed:', error.message);
            process.exit(1);
        });
}

module.exports = CompleteSprintAssignments;