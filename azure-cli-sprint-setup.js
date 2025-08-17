#!/usr/bin/env node
// Azure CLI-based sprint setup to bypass REST API limitations

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class AzureCliSprintSetup {
    constructor() {
        this.organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
        this.project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
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

    async checkAzureCliInstalled() {
        console.log('🔍 Checking Azure CLI installation...');
        const result = await this.runCommand('az --version', 'Check Azure CLI version');
        return result.success;
    }

    async loginToAzure() {
        console.log('🔐 Checking Azure authentication...');
        const result = await this.runCommand('az account show', 'Check authentication status');
        
        if (!result.success) {
            console.log('🔑 Need to authenticate to Azure...');
            console.log('Run: az login');
            return false;
        }
        
        return true;
    }

    async setupAzureDevOpsExtension() {
        console.log('🔧 Setting up Azure DevOps extension...');
        
        // Install Azure DevOps extension
        await this.runCommand('az extension add --name azure-devops', 'Install Azure DevOps extension');
        
        // Configure organization
        const configCmd = `az devops configure --defaults organization=https://dev.azure.com/${this.organization} project=${this.project}`;
        await this.runCommand(configCmd, 'Configure Azure DevOps defaults');
        
        return true;
    }

    async configureTeamIterations() {
        console.log('\n📋 Configuring team iterations using Azure CLI...');
        
        const sprints = [
            'MVP-Planning-Sprint',
            'Sprint-1-2-Event-Creation', 
            'Sprint-3-Event-Search',
            'Sprint-4-Event-Filtering',
            'MVP-Launch-Sprint',
            'Sprint-5-MVP-Enhancement',
            'Post-MVP-Backlog'
        ];
        
        const results = [];
        
        for (const sprint of sprints) {
            console.log(`\n🔄 Adding ${sprint} to team configuration...`);
            
            // Use Azure CLI to add iteration to team
            const cmd = `az boards iteration team add --id "${sprint}" --team "${this.project} Team" --org "https://dev.azure.com/${this.organization}" --project "${this.project}"`;
            
            const result = await this.runCommand(cmd, `Add ${sprint} to team`);
            results.push({
                sprint,
                success: result.success,
                error: result.error
            });
        }
        
        return results;
    }

    async assignWorkItemsToSprints() {
        console.log('\n🔗 Assigning work items to sprints using Azure CLI...');
        
        const assignments = [
            { workItemId: 15, sprint: 'Sprint-1-2-Event-Creation' },
            { workItemId: 19, sprint: 'Sprint-3-Event-Search' },
            { workItemId: 20, sprint: 'Sprint-4-Event-Filtering' },
            { workItemId: 16, sprint: 'Sprint-5-MVP-Enhancement' },
            { workItemId: 17, sprint: 'Post-MVP-Backlog' },
            { workItemId: 18, sprint: 'Post-MVP-Backlog' },
            { workItemId: 21, sprint: 'Post-MVP-Backlog' }
        ];
        
        const results = [];
        
        for (const assignment of assignments) {
            console.log(`\n🔄 Assigning US#${assignment.workItemId} to ${assignment.sprint}...`);
            
            // Use Azure CLI to update work item iteration
            const cmd = `az boards work-item update --id ${assignment.workItemId} --iteration "${assignment.sprint}" --org "https://dev.azure.com/${this.organization}" --project "${this.project}"`;
            
            const result = await this.runCommand(cmd, `Assign US#${assignment.workItemId} to ${assignment.sprint}`);
            results.push({
                workItemId: assignment.workItemId,
                sprint: assignment.sprint,
                success: result.success,
                error: result.error
            });
        }
        
        return results;
    }

    async completeSprintSetup() {
        console.log('🚀 Starting Azure CLI-based Sprint Setup...\n');
        
        try {
            // Step 1: Check prerequisites
            const hasAzCli = await this.checkAzureCliInstalled();
            if (!hasAzCli) {
                throw new Error('Azure CLI not installed. Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli');
            }
            
            const isAuthenticated = await this.loginToAzure();
            if (!isAuthenticated) {
                throw new Error('Not authenticated to Azure. Run: az login');
            }
            
            // Step 2: Setup Azure DevOps extension
            await this.setupAzureDevOpsExtension();
            
            // Step 3: Configure team iterations
            console.log('\n📋 Step 3: Configuring team iterations...');
            const iterationResults = await this.configureTeamIterations();
            
            const successfulIterations = iterationResults.filter(r => r.success);
            console.log(`\n✅ Successfully configured ${successfulIterations.length}/${iterationResults.length} iterations`);
            
            // Step 4: Assign work items
            console.log('\n📋 Step 4: Assigning work items to sprints...');
            const assignmentResults = await this.assignWorkItemsToSprints();
            
            const successfulAssignments = assignmentResults.filter(r => r.success);
            console.log(`\n✅ Successfully assigned ${successfulAssignments.length}/${assignmentResults.length} work items`);
            
            // Generate summary
            this.generateSummary(iterationResults, assignmentResults);
            
            return {
                iterationsConfigured: successfulIterations.length,
                workItemsAssigned: successfulAssignments.length,
                totalIterations: iterationResults.length,
                totalWorkItems: assignmentResults.length
            };
            
        } catch (error) {
            console.error('\n💥 Azure CLI sprint setup failed:', error.message);
            throw error;
        }
    }

    generateSummary(iterationResults, assignmentResults) {
        console.log('\n' + '═'.repeat(80));
        console.log('📊 AZURE CLI SPRINT SETUP SUMMARY');
        console.log('═'.repeat(80));
        
        const successfulIterations = iterationResults.filter(r => r.success);
        const successfulAssignments = assignmentResults.filter(r => r.success);
        
        console.log(`✅ Team iterations configured: ${successfulIterations.length}/${iterationResults.length}`);
        console.log(`✅ Work items assigned: ${successfulAssignments.length}/${assignmentResults.length}`);
        
        if (successfulAssignments.length > 0) {
            console.log('\n🎯 SUCCESSFUL ASSIGNMENTS:');
            successfulAssignments.forEach(result => {
                console.log(`   ✅ US#${result.workItemId}: ${result.sprint}`);
            });
        }
        
        const failedAssignments = assignmentResults.filter(r => !r.success);
        if (failedAssignments.length > 0) {
            console.log('\n❌ FAILED ASSIGNMENTS:');
            failedAssignments.forEach(result => {
                console.log(`   • US#${result.workItemId}: ${result.error}`);
            });
        }
        
        if (successfulIterations.length === iterationResults.length && 
            successfulAssignments.length === assignmentResults.length) {
            console.log('\n🎉 PERFECT SUCCESS! Azure CLI approach worked!');
            console.log('✅ All MVP sprints configured for team');
            console.log('✅ All work items assigned to correct sprints');
            console.log('\n🎪 CHECK AZURE DEVOPS → BOARDS → SPRINTS:');
            console.log('   📅 Complete sprint timeline visible');
            console.log('   🎯 Work items distributed across sprints');
            console.log('   📊 Burndown charts and velocity tracking ready');
        } else {
            console.log('\n⚠️ PARTIAL SUCCESS - Azure CLI has limitations too');
            console.log('\nALTERNATIVE SOLUTIONS:');
            console.log('1. Manual team configuration (one-time setup)');
            console.log('2. PowerShell with Azure DevOps REST API');
            console.log('3. Azure DevOps extension for VS Code');
        }
    }
}

// Execute if run directly
if (require.main === module) {
    const setup = new AzureCliSprintSetup();
    setup.completeSprintSetup()
        .then((summary) => {
            console.log(`\n🏁 Azure CLI setup complete!`);
            console.log(`   📅 Iterations: ${summary.iterationsConfigured}/${summary.totalIterations}`);
            console.log(`   🔗 Assignments: ${summary.workItemsAssigned}/${summary.totalWorkItems}`);
        })
        .catch((error) => {
            console.error('💥 Setup failed:', error.message);
            process.exit(1);
        });
}

module.exports = AzureCliSprintSetup;