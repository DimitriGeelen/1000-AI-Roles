#!/usr/bin/env node
// Create proper sprint structure and milestone management in Azure DevOps
// This creates the actual iteration paths, sprints, and assigns work items

const axios = require('axios');
require('dotenv').config();

class SprintStructureCreator {
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
    
    // Create iteration paths (sprints) in Azure DevOps
    async createIterationPath(iterationName, startDate, endDate, parentPath = null) {
        const url = `https://dev.azure.com/${this.organization}/${this.project}/_apis/wit/classificationNodes/iterations?api-version=${this.apiVersion}`;
        
        const iterationData = {
            name: iterationName,
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
                }
            });
            
            return {
                success: true,
                name: iterationName,
                id: response.data.id,
                path: response.data.path,
                startDate,
                endDate
            };
        } catch (error) {
            return {
                success: false,
                name: iterationName,
                error: error.response?.data?.message || error.message
            };
        }
    }
    
    // Get existing iteration paths
    async getIterationPaths() {
        const url = `https://dev.azure.com/${this.organization}/${this.project}/_apis/wit/classificationNodes/iterations?api-version=${this.apiVersion}&$depth=2`;
        
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
    
    // Assign work item to iteration
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
                iterationPath,
                title: response.data.fields['System.Title']
            };
        } catch (error) {
            return {
                success: false,
                workItemId,
                error: error.message
            };
        }
    }
}

async function createSprintPlanningStructure() {
    const creator = new SprintStructureCreator();
    
    console.log('🏗️ Creating Sprint Planning Structure in Azure DevOps...\n');
    
    // Step 1: Check existing iterations
    console.log('🔍 Step 1: Checking existing iteration structure...');
    const existingIterations = await creator.getIterationPaths();
    
    if (existingIterations.success) {
        console.log('✅ Current iterations found:');
        existingIterations.iterations.forEach(iter => {
            console.log(`   • ${iter.name} (${iter.path})`);
        });
    } else {
        console.log('⚠️ Could not retrieve existing iterations:', existingIterations.error);
    }
    
    // Step 2: Define MVP sprint structure
    console.log('\n📅 Step 2: Defining MVP Sprint Structure...');
    
    const currentDate = new Date();
    const sprintDefinitions = [
        {
            name: 'MVP Planning Sprint',
            startDate: new Date(2025, 0, 1), // January 1, 2025
            endDate: new Date(2025, 0, 14),   // January 14, 2025
            description: 'Initial MVP planning and setup'
        },
        {
            name: 'Sprint 1-2: Event Creation',
            startDate: new Date(2025, 0, 15), // January 15, 2025  
            endDate: new Date(2025, 1, 11),   // February 11, 2025 (4 weeks)
            description: 'Basic Event Creation Workflow (US#15)',
            workItems: [15]
        },
        {
            name: 'Sprint 3: Event Search',
            startDate: new Date(2025, 1, 12), // February 12, 2025
            endDate: new Date(2025, 2, 11),   // March 11, 2025 (4 weeks)
            description: 'Basic Event Search (US#19)',
            workItems: [19]
        },
        {
            name: 'Sprint 4: Event Filtering',
            startDate: new Date(2025, 2, 12), // March 12, 2025
            endDate: new Date(2025, 3, 8),    // April 8, 2025 (4 weeks)
            description: 'Event Filtering by Type & Category (US#20)',
            workItems: [20]
        },
        {
            name: 'MVP Launch Sprint',
            startDate: new Date(2025, 3, 9),  // April 9, 2025
            endDate: new Date(2025, 4, 6),    // May 6, 2025 (4 weeks)
            description: 'Final integration and May 2026 launch preparation'
        },
        {
            name: 'Sprint 5: MVP Enhancement',
            startDate: new Date(2025, 4, 7),  // May 7, 2025
            endDate: new Date(2025, 5, 3),    // June 3, 2025 (4 weeks)  
            description: 'Event Editing and Management (US#16)',
            workItems: [16]
        },
        {
            name: 'Post-MVP Backlog',
            startDate: new Date(2025, 5, 4),  // June 4, 2025
            endDate: new Date(2025, 11, 31),  // December 31, 2025
            description: 'Future enhancements (US#17, US#18, US#21)',
            workItems: [17, 18, 21]
        }
    ];
    
    // Step 3: Create iterations (if they don't exist)
    console.log('\n🏗️ Step 3: Creating Sprint Iterations...');
    const iterationResults = [];
    
    for (const sprint of sprintDefinitions) {
        console.log(`\n🔄 Creating: ${sprint.name}...`);
        
        const result = await creator.createIterationPath(
            sprint.name,
            sprint.startDate.toISOString(),
            sprint.endDate.toISOString()
        );
        
        iterationResults.push({
            ...result,
            ...sprint
        });
        
        if (result.success) {
            console.log(`✅ Created sprint: ${sprint.name}`);
            console.log(`   📅 Duration: ${sprint.startDate.toDateString()} → ${sprint.endDate.toDateString()}`);
            console.log(`   📝 Description: ${sprint.description}`);
        } else {
            console.log(`⚠️ Sprint creation result: ${result.error}`);
            // This might fail if iterations already exist, which is OK
        }
    }
    
    // Step 4: Assign work items to sprints
    console.log('\n🔗 Step 4: Assigning User Stories to Sprints...');
    const assignmentResults = [];
    
    for (const sprint of sprintDefinitions) {
        if (sprint.workItems && sprint.workItems.length > 0) {
            console.log(`\n📋 Assigning work items to: ${sprint.name}`);
            
            for (const workItemId of sprint.workItems) {
                const iterationPath = `${creator.project}\\${sprint.name}`;
                
                const result = await creator.assignWorkItemToIteration(workItemId, iterationPath);
                assignmentResults.push(result);
                
                if (result.success) {
                    console.log(`✅ US#${workItemId}: ${result.title} → ${sprint.name}`);
                } else {
                    console.log(`❌ US#${workItemId}: ${result.error}`);
                }
            }
        }
    }
    
    // Step 5: Generate Sprint Planning Summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 SPRINT PLANNING STRUCTURE SUMMARY');
    console.log('═'.repeat(80));
    
    const successfulIterations = iterationResults.filter(r => r.success);
    const successfulAssignments = assignmentResults.filter(r => r.success);
    
    console.log(`🏗️ Sprint Iterations: ${successfulIterations.length}/${sprintDefinitions.length} processed`);
    console.log(`🔗 Work Item Assignments: ${successfulAssignments.length}/${assignmentResults.length} successful`);
    
    if (successfulIterations.length > 0) {
        console.log('\n📅 CREATED SPRINT TIMELINE:');
        sprintDefinitions.forEach(sprint => {
            console.log(`\n📋 ${sprint.name}`);
            console.log(`   📅 ${sprint.startDate.toDateString()} → ${sprint.endDate.toDateString()}`);
            console.log(`   📝 ${sprint.description}`);
            if (sprint.workItems) {
                console.log(`   🎯 Work Items: US#${sprint.workItems.join(', US#')}`);
            }
        });
    }
    
    console.log('\n🎯 MVP MILESTONE ROADMAP:');
    console.log('   🎪 January 2025: MVP Planning Sprint');
    console.log('   📱 Jan-Feb 2025: Sprint 1-2 - Event Creation (US#15)');
    console.log('   🔍 Feb-Mar 2025: Sprint 3 - Event Search (US#19)');
    console.log('   🎛️ Mar-Apr 2025: Sprint 4 - Event Filtering (US#20)');
    console.log('   🚀 Apr-May 2025: MVP Launch Sprint');
    console.log('   ⚡ May-Jun 2025: Sprint 5 - MVP Enhancement (US#16)');
    console.log('   📋 Jun-Dec 2025: Post-MVP Backlog (US#17, US#18, US#21)');
    
    console.log('\n🏆 SUCCESS METRICS TIMELINE:');
    console.log('   📊 Q1 2025: Basic Version completion (7 story points)');
    console.log('   🎯 May 2025: Village pilot launch (150 users)');
    console.log('   📈 Q2 2025: MVP enhancement (2 story points)');
    console.log('   🔄 Q3-Q4 2025: Post-MVP features based on pilot feedback');
    
    console.log('\n🎪 AZURE DEVOPS SPRINT BOARDS:');
    console.log('   • Sprint planning view with proper iteration assignments');
    console.log('   • Milestone tracking with start/end dates');
    console.log('   • Work item kanban boards by sprint');
    console.log('   • Velocity tracking and burndown charts');
    
    return {
        iterationsCreated: successfulIterations.length,
        workItemsAssigned: successfulAssignments.length,
        totalSprints: sprintDefinitions.length
    };
}

// Execute sprint structure creation
if (require.main === module) {
    createSprintPlanningStructure().then((summary) => {
        console.log(`\n🏁 Sprint planning structure complete!`);
        console.log(`   🏗️ Iterations: ${summary.iterationsCreated}/${summary.totalSprints}`);
        console.log(`   🔗 Assignments: ${summary.workItemsAssigned} work items`);
        console.log('\n➡️ Check Azure DevOps Boards for sprint planning view!');
    }).catch((error) => {
        console.error('💥 Sprint structure creation failed:', error.message);
    });
}

module.exports = { SprintStructureCreator, createSprintPlanningStructure };