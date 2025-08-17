#!/usr/bin/env node
// Corrected Azure CLI sprint setup with proper iteration IDs and syntax

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class AzureCliCorrectedSetup {
    constructor() {
        this.organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
        this.project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
        
        // Correct iteration mappings from check-sprints-exist.js
        this.iterations = [
            { id: 12, name: 'MVP-Planning-Sprint', path: '\\fnb-pricing\\Iteration\\MVP-Planning-Sprint' },
            { id: 13, name: 'Sprint-1-2-Event-Creation', path: '\\fnb-pricing\\Iteration\\Sprint-1-2-Event-Creation' },
            { id: 14, name: 'Sprint-3-Event-Search', path: '\\fnb-pricing\\Iteration\\Sprint-3-Event-Search' },
            { id: 15, name: 'Sprint-4-Event-Filtering', path: '\\fnb-pricing\\Iteration\\Sprint-4-Event-Filtering' },
            { id: 16, name: 'MVP-Launch-Sprint', path: '\\fnb-pricing\\Iteration\\MVP-Launch-Sprint' },
            { id: 17, name: 'Sprint-5-MVP-Enhancement', path: '\\fnb-pricing\\Iteration\\Sprint-5-MVP-Enhancement' },
            { id: 18, name: 'Post-MVP-Backlog', path: '\\fnb-pricing\\Iteration\\Post-MVP-Backlog' }
        ];
    }

    async runCommand(command, description) {
        console.log(`🔄 ${description}...`);
        console.log(`💻 Command: ${command}`);
        
        try {
            const { stdout, stderr } = await execAsync(command);
            
            if (stderr && !stderr.includes('WARNING')) {
                console.log(`⚠️ Warning: ${stderr}`);
            }
            
            console.log(`✅ Success: ${description}`);
            if (stdout.trim()) {
                console.log(`📋 Output:\n${stdout}`);
            }
            
            return { success: true, output: stdout, error: null };
        } catch (error) {
            console.log(`❌ Failed: ${description}`);
            console.log(`💥 Error: ${error.message}`);
            return { success: false, output: null, error: error.message };
        }
    }

    async configureTeamIterations() {
        console.log('🔧 Configuring team iterations with correct IDs...\n');
        
        const results = [];
        
        for (const iteration of this.iterations) {
            console.log(`🔄 Adding ${iteration.name} (ID: ${iteration.id}) to team...`);
            
            // Use correct Azure CLI syntax with -p flag for project
            const cmd = `az boards iteration team add --id "${iteration.id}" --team "fnb-pricing Team" --org "https://dev.azure.com/${this.organization}" -p "${this.project}"`;
            
            const result = await this.runCommand(cmd, `Add ${iteration.name} to team`);
            results.push({
                iteration: iteration.name,
                id: iteration.id,
                success: result.success,
                error: result.error
            });
            
            console.log(''); // Add spacing
        }
        
        return results;
    }

    async assignWorkItemsToSprints() {
        console.log('🔗 Assigning work items to sprints with correct iteration paths...\n');
        
        const assignments = [
            { workItemId: 15, iterationPath: 'fnb-pricing\\Iteration\\Sprint-1-2-Event-Creation', sprintName: 'Sprint-1-2-Event-Creation' },
            { workItemId: 19, iterationPath: 'fnb-pricing\\Iteration\\Sprint-3-Event-Search', sprintName: 'Sprint-3-Event-Search' },
            { workItemId: 20, iterationPath: 'fnb-pricing\\Iteration\\Sprint-4-Event-Filtering', sprintName: 'Sprint-4-Event-Filtering' },
            { workItemId: 16, iterationPath: 'fnb-pricing\\Iteration\\Sprint-5-MVP-Enhancement', sprintName: 'Sprint-5-MVP-Enhancement' },
            { workItemId: 17, iterationPath: 'fnb-pricing\\Iteration\\Post-MVP-Backlog', sprintName: 'Post-MVP-Backlog' },
            { workItemId: 18, iterationPath: 'fnb-pricing\\Iteration\\Post-MVP-Backlog', sprintName: 'Post-MVP-Backlog' },
            { workItemId: 21, iterationPath: 'fnb-pricing\\Iteration\\Post-MVP-Backlog', sprintName: 'Post-MVP-Backlog' }
        ];
        
        const results = [];
        
        for (const assignment of assignments) {
            console.log(`🔄 Assigning US#${assignment.workItemId} to ${assignment.sprintName}...`);
            
            // Use correct Azure CLI syntax without --project flag (use -p or let defaults handle it)
            const cmd = `az boards work-item update --id ${assignment.workItemId} --iteration "${assignment.iterationPath}" --org "https://dev.azure.com/${this.organization}"`;
            
            const result = await this.runCommand(cmd, `Assign US#${assignment.workItemId} to ${assignment.sprintName}`);
            results.push({
                workItemId: assignment.workItemId,
                sprintName: assignment.sprintName,
                success: result.success,
                error: result.error
            });
            
            console.log(''); // Add spacing
        }
        
        return results;
    }

    async completeSetup() {
        console.log('🚀 Starting Corrected Azure CLI Sprint Setup...\n');
        
        try {
            // Step 1: Configure team iterations
            console.log('📋 Step 1: Configuring team iterations...');
            const iterationResults = await this.configureTeamIterations();
            
            const successfulIterations = iterationResults.filter(r => r.success);
            console.log(`✅ Successfully configured ${successfulIterations.length}/${iterationResults.length} iterations\n`);
            
            // Step 2: Assign work items to sprints
            console.log('📋 Step 2: Assigning work items to sprints...');
            const assignmentResults = await this.assignWorkItemsToSprints();
            
            const successfulAssignments = assignmentResults.filter(r => r.success);
            console.log(`✅ Successfully assigned ${successfulAssignments.length}/${assignmentResults.length} work items\n`);
            
            // Generate summary
            this.generateSummary(iterationResults, assignmentResults);
            
            return {
                iterationsConfigured: successfulIterations.length,
                workItemsAssigned: successfulAssignments.length,
                totalIterations: iterationResults.length,
                totalWorkItems: assignmentResults.length
            };
            
        } catch (error) {
            console.error('\n💥 Setup failed:', error.message);
            throw error;
        }
    }

    generateSummary(iterationResults, assignmentResults) {
        console.log('═'.repeat(80));
        console.log('📊 CORRECTED AZURE CLI SETUP SUMMARY');
        console.log('═'.repeat(80));
        
        const successfulIterations = iterationResults.filter(r => r.success);
        const successfulAssignments = assignmentResults.filter(r => r.success);
        
        console.log(`✅ Team iterations configured: ${successfulIterations.length}/${iterationResults.length}`);
        console.log(`✅ Work items assigned: ${successfulAssignments.length}/${assignmentResults.length}`);
        
        if (successfulIterations.length > 0) {
            console.log('\n🎯 CONFIGURED ITERATIONS:');
            successfulIterations.forEach(result => {
                console.log(`   ✅ ${result.iteration} (ID: ${result.id})`);
            });
        }
        
        if (successfulAssignments.length > 0) {
            console.log('\n🔗 SUCCESSFUL ASSIGNMENTS:');
            successfulAssignments.forEach(result => {
                console.log(`   ✅ US#${result.workItemId}: ${result.sprintName}`);
            });
        }
        
        const failedIterations = iterationResults.filter(r => !r.success);
        const failedAssignments = assignmentResults.filter(r => !r.success);
        
        if (failedIterations.length > 0) {
            console.log('\n❌ FAILED ITERATION CONFIGURATIONS:');
            failedIterations.forEach(result => {
                console.log(`   • ${result.iteration}: ${result.error}`);
            });
        }
        
        if (failedAssignments.length > 0) {
            console.log('\n❌ FAILED ASSIGNMENTS:');
            failedAssignments.forEach(result => {
                console.log(`   • US#${result.workItemId}: ${result.error}`);
            });
        }
        
        if (successfulIterations.length === iterationResults.length && 
            successfulAssignments.length === assignmentResults.length) {
            console.log('\n🎉 PERFECT SUCCESS! Programmatic sprint planning complete!');
            console.log('✅ All MVP sprints configured for team');
            console.log('✅ All work items assigned to correct sprints');
            console.log('\n🎪 CHECK AZURE DEVOPS → BOARDS → SPRINTS:');
            console.log('   📅 Complete sprint timeline (Jan 2025 - Dec 2025)');
            console.log('   🎯 Work items distributed across MVP phases');
            console.log('   📊 Burndown charts and velocity tracking ready');
            console.log('   🚀 May 2025 village pilot launch milestone visible');
        } else {
            console.log('\n⚠️ PARTIAL SUCCESS - Some operations failed');
            if (successfulIterations.length > 0 || successfulAssignments.length > 0) {
                console.log('✅ Progress made - check Azure DevOps for updated configuration');
            }
        }
    }
}

// Execute if run directly
if (require.main === module) {
    const setup = new AzureCliCorrectedSetup();
    setup.completeSetup()
        .then((summary) => {
            console.log(`\n🏁 Corrected Azure CLI setup complete!`);
            console.log(`   📅 Iterations: ${summary.iterationsConfigured}/${summary.totalIterations}`);
            console.log(`   🔗 Assignments: ${summary.workItemsAssigned}/${summary.totalWorkItems}`);
            
            if (summary.iterationsConfigured === summary.totalIterations && 
                summary.workItemsAssigned === summary.totalWorkItems) {
                console.log('\n🎊 SUCCESS! Complete programmatic sprint planning achieved!');
            }
        })
        .catch((error) => {
            console.error('💥 Setup failed:', error.message);
            process.exit(1);
        });
}

module.exports = AzureCliCorrectedSetup;