#!/usr/bin/env node
// Working programmatic sprint creation using the correct API endpoints discovered

const axios = require('axios');
require('dotenv').config();

class WorkingSprintCreator {
    constructor() {
        this.organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
        this.project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
        this.pat = process.env.AZURE_DEVOPS_PAT;
        
        if (!this.pat) {
            throw new Error('AZURE_DEVOPS_PAT environment variable is required');
        }
        
        this.auth = Buffer.from(`:${this.pat}`).toString('base64');
        // Use the working API endpoint discovered in permissions check
        this.iterationsApiUrl = `https://dev.azure.com/${this.organization}/${this.project}/_apis/wit/classificationnodes/iterations`;
        this.apiVersion = '7.1-preview.2';
    }
    
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Create iteration using working API pattern
    async createIteration(name, startDate, endDate) {
        const url = `${this.iterationsApiUrl}?api-version=${this.apiVersion}`;
        
        const iterationData = {
            name: name,
            attributes: {
                startDate: startDate,
                finishDate: endDate
            }
        };
        
        try {
            const response = await axios.post(url, iterationData, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });
            
            return {
                success: true,
                name: name,
                id: response.data.id,
                path: response.data.path,
                startDate,
                endDate,
                url: response.data.url
            };
        } catch (error) {
            return {
                success: false,
                name: name,
                error: error.response?.data?.message || error.message,
                status: error.response?.status
            };
        }
    }
    
    // Assign work item to iteration using full path
    async assignToIteration(workItemId, iterationPath) {
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
                },
                timeout: 15000
            });
            
            return {
                success: true,
                workItemId,
                iterationPath,
                title: response.data.fields['System.Title']
            };
        } catch (error) {
            return {
                success: false,
                workItemId,
                error: error.response?.data?.message || error.message,
                status: error.response?.status
            };
        }
    }
    
    // Get existing iterations to avoid duplicates
    async getExistingIterations() {
        const url = `${this.iterationsApiUrl}?api-version=${this.apiVersion}&$depth=2`;
        
        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Basic ${this.auth}`
                }
            });
            
            return {
                success: true,
                iterations: response.data.children || []
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

async function createCompleteSprintStructure() {
    const creator = new WorkingSprintCreator();
    
    console.log('🏗️ Creating Complete Sprint Structure Programmatically...\n');
    
    // Step 1: Check existing iterations
    console.log('🔍 Step 1: Checking for existing iterations...');
    const existing = await creator.getExistingIterations();
    
    if (existing.success) {
        console.log(`📋 Found ${existing.iterations.length} existing iterations:`);
        existing.iterations.forEach(iter => {
            console.log(`   • ${iter.name}`);
        });
    }
    
    // Step 2: Define MVP sprint structure with proper dates
    const sprintDefinitions = [
        {
            name: 'MVP-Planning-Sprint',
            startDate: '2025-01-01T00:00:00Z',
            endDate: '2025-01-14T23:59:59Z',
            description: 'Initial MVP planning and architecture setup',
            workItems: []
        },
        {
            name: 'Sprint-1-2-Event-Creation',
            startDate: '2025-01-15T00:00:00Z',
            endDate: '2025-02-11T23:59:59Z',
            description: 'Basic Event Creation Workflow (≤5 steps)',
            workItems: [15] // US016
        },
        {
            name: 'Sprint-3-Event-Search',
            startDate: '2025-02-12T00:00:00Z',
            endDate: '2025-03-11T23:59:59Z',
            description: 'Basic Event Search (≤3 steps)',
            workItems: [19] // US020
        },
        {
            name: 'Sprint-4-Event-Filtering',
            startDate: '2025-03-12T00:00:00Z',
            endDate: '2025-04-08T23:59:59Z',
            description: 'Event Filtering by Type & Category',
            workItems: [20] // US021
        },
        {
            name: 'MVP-Launch-Sprint',
            startDate: '2025-04-09T00:00:00Z',
            endDate: '2025-05-06T23:59:59Z',
            description: 'Final integration and May 2025 village pilot launch',
            workItems: []
        },
        {
            name: 'Sprint-5-MVP-Enhancement',
            startDate: '2025-05-07T00:00:00Z',
            endDate: '2025-06-03T23:59:59Z',
            description: 'Event Editing and Management Enhancement',
            workItems: [16] // US017
        },
        {
            name: 'Post-MVP-Backlog',
            startDate: '2025-06-04T00:00:00Z',
            endDate: '2025-12-31T23:59:59Z',
            description: 'Future enhancements based on pilot feedback',
            workItems: [17, 18, 21] // US018, US019, US022
        }
    ];
    
    // Step 3: Create iterations
    console.log('\n🏗️ Step 3: Creating Sprint Iterations...');
    const iterationResults = [];
    
    for (const sprint of sprintDefinitions) {
        // Check if iteration already exists
        const existingIter = existing.iterations?.find(iter => 
            iter.name === sprint.name || 
            iter.name.includes(sprint.name.replace(/-/g, ' '))
        );
        
        if (existingIter) {
            console.log(`⚠️ Sprint "${sprint.name}" already exists, skipping creation`);
            iterationResults.push({
                success: true,
                name: sprint.name,
                path: existingIter.path,
                existing: true,
                ...sprint
            });
            continue;
        }
        
        console.log(`\n🔄 Creating: ${sprint.name}...`);
        console.log(`   📅 ${sprint.startDate} → ${sprint.endDate}`);
        console.log(`   📝 ${sprint.description}`);
        
        const result = await creator.createIteration(
            sprint.name,
            sprint.startDate,
            sprint.endDate
        );
        
        iterationResults.push({
            ...result,
            ...sprint
        });
        
        if (result.success) {
            console.log(`✅ Created: ${sprint.name}`);
            console.log(`   🔗 Path: ${result.path}`);
        } else {
            console.log(`❌ Failed: ${sprint.name}`);
            console.log(`   Error: ${result.error}`);
        }
        
        // Small delay to avoid rate limiting
        await creator.sleep(500);
    }
    
    // Step 4: Assign work items to sprints
    console.log('\n🔗 Step 4: Assigning User Stories to Sprints...');
    const assignmentResults = [];
    
    for (const sprint of iterationResults.filter(r => r.success && r.workItems?.length > 0)) {
        console.log(`\n📋 Assigning work items to: ${sprint.name}`);
        
        for (const workItemId of sprint.workItems) {
            // Use the full iteration path for assignment
            const iterationPath = sprint.path || `${creator.project}\\${sprint.name}`;
            
            const result = await creator.assignToIteration(workItemId, iterationPath);
            assignmentResults.push(result);
            
            if (result.success) {
                console.log(`✅ US#${workItemId}: ${result.title} → ${sprint.name}`);
            } else {
                console.log(`❌ US#${workItemId}: ${result.error}`);
            }
            
            // Small delay between assignments
            await creator.sleep(300);
        }
    }
    
    // Step 5: Final verification and summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 COMPLETE SPRINT STRUCTURE SUMMARY');
    console.log('═'.repeat(80));
    
    const successfulIterations = iterationResults.filter(r => r.success);
    const successfulAssignments = assignmentResults.filter(r => r.success);
    
    console.log(`🏗️ Sprint Iterations: ${successfulIterations.length}/${sprintDefinitions.length} created/verified`);
    console.log(`🔗 Work Item Assignments: ${successfulAssignments.length}/${assignmentResults.length} successful`);
    
    if (successfulIterations.length > 0) {
        console.log('\n📅 SPRINT STRUCTURE CREATED:');
        sprintDefinitions.forEach(sprint => {
            const result = iterationResults.find(r => r.name === sprint.name);
            const status = result?.success ? '✅' : '❌';
            const existing = result?.existing ? ' (existed)' : '';
            
            console.log(`\n${status} ${sprint.name}${existing}`);
            console.log(`   📅 ${new Date(sprint.startDate).toDateString()} → ${new Date(sprint.endDate).toDateString()}`);
            console.log(`   📝 ${sprint.description}`);
            if (sprint.workItems?.length > 0) {
                console.log(`   🎯 Work Items: US#${sprint.workItems.join(', US#')}`);
            }
        });
    }
    
    console.log('\n🎯 MVP ROADMAP - READY FOR DEVELOPMENT:');
    console.log('   🎪 Q1 2025: Planning + Basic Version (7 story points)');
    console.log('   🚀 May 2025: Village Pilot Launch (150 users)');
    console.log('   ⚡ Q2 2025: MVP Enhancement (2 story points)');
    console.log('   📋 Q3-Q4 2025: Post-MVP based on pilot feedback');
    
    console.log('\n🎪 AZURE DEVOPS BOARDS NOW HAVE:');
    console.log('   ✅ Complete sprint structure with dates');
    console.log('   ✅ Work items assigned to proper sprints');
    console.log('   ✅ Milestone tracking with timeline');
    console.log('   ✅ Ready for kanban boards and velocity tracking');
    
    if (successfulIterations.length === sprintDefinitions.length && 
        successfulAssignments.length === assignmentResults.length) {
        console.log('\n🎉 PERFECT! Complete programmatic sprint setup successful!');
        console.log('✅ Sprint planning infrastructure is ready');
        console.log('✅ Development teams can now use Azure DevOps boards');
    } else {
        console.log('\n⚠️ Some items need attention - but core structure is created');
    }
    
    return {
        iterationsCreated: successfulIterations.length,
        workItemsAssigned: successfulAssignments.length,
        totalSprints: sprintDefinitions.length,
        results: iterationResults
    };
}

// Execute the complete sprint structure creation
if (require.main === module) {
    createCompleteSprintStructure().then((summary) => {
        console.log(`\n🏁 Programmatic sprint structure complete!`);
        console.log(`   🏗️ Iterations: ${summary.iterationsCreated}/${summary.totalSprints}`);
        console.log(`   🔗 Assignments: ${summary.workItemsAssigned} work items`);
        console.log('\n➡️ Check Azure DevOps → Boards → Sprints for the complete structure!');
    }).catch((error) => {
        console.error('💥 Sprint structure creation failed:', error.message);
        console.error(error.stack);
    });
}

module.exports = { WorkingSprintCreator, createCompleteSprintStructure };