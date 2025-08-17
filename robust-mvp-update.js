#!/usr/bin/env node
// Robust MVP prioritization with retry logic and error handling
// Sustainable solution without process breakdown risk

const axios = require('axios');
require('dotenv').config();

class RobustAzureDevOps {
    constructor() {
        this.organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
        this.project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
        this.pat = process.env.AZURE_DEVOPS_PAT;
        
        if (!this.pat) {
            throw new Error('AZURE_DEVOPS_PAT environment variable is required');
        }
        
        this.auth = Buffer.from(`:${this.pat}`).toString('base64');
        this.baseUrl = `https://dev.azure.com/${this.organization}/${this.project}`;
        this.apiVersion = '7.1-preview.3';
        this.maxRetries = 3;
        this.retryDelay = 2000; // 2 seconds
    }
    
    // Robust API call with retry logic
    async robustApiCall(method, url, data = null, retryCount = 0) {
        try {
            const config = {
                method,
                url,
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Accept': 'application/json'
                },
                timeout: 15000
            };
            
            if (data && method.toLowerCase() === 'patch') {
                config.headers['Content-Type'] = 'application/json-patch+json';
                config.data = data;
            } else if (data) {
                config.data = data;
            }
            
            const response = await axios(config);
            return { success: true, data: response.data, status: response.status };
            
        } catch (error) {
            const isRetryable = error.code === 'ECONNRESET' || 
                               error.code === 'ETIMEDOUT' ||
                               (error.response?.status >= 500 && error.response?.status < 600) ||
                               error.response?.status === 404; // Retry 404s as they might be temporary
            
            if (isRetryable && retryCount < this.maxRetries) {
                console.log(`⚠️ Retry ${retryCount + 1}/${this.maxRetries} after ${this.retryDelay}ms for: ${error.message}`);
                await this.sleep(this.retryDelay);
                return this.robustApiCall(method, url, data, retryCount + 1);
            }
            
            return {
                success: false,
                error: error.message,
                status: error.response?.status,
                data: error.response?.data
            };
        }
    }
    
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Get work item with robust error handling
    async getWorkItem(workItemId) {
        const url = `${this.baseUrl}/_apis/wit/workitems/${workItemId}?api-version=${this.apiVersion}`;
        const result = await this.robustApiCall('GET', url);
        
        if (result.success) {
            return {
                success: true,
                id: workItemId,
                state: result.data.fields['System.State'],
                title: result.data.fields['System.Title'],
                type: result.data.fields['System.WorkItemType'],
                tags: result.data.fields['System.Tags'] || '',
                priority: result.data.fields['Microsoft.VSTS.Common.Priority'],
                url: `${this.baseUrl}/_workitems/edit/${workItemId}`
            };
        }
        
        return { success: false, id: workItemId, error: result.error };
    }
    
    // Update work item with MVP tags and priority
    async updateWorkItemMVP(workItemId, mvpData) {
        const url = `${this.baseUrl}/_apis/wit/workitems/${workItemId}?api-version=${this.apiVersion}`;
        
        const operations = [];
        
        // Add MVP tags
        if (mvpData.tags) {
            operations.push({
                op: 'add',
                path: '/fields/System.Tags',
                value: mvpData.tags.join('; ')
            });
        }
        
        // Update priority
        if (mvpData.priority) {
            operations.push({
                op: 'add',
                path: '/fields/Microsoft.VSTS.Common.Priority',
                value: mvpData.priority
            });
        }
        
        // Add MVP description to history
        if (mvpData.description) {
            operations.push({
                op: 'add',
                path: '/fields/System.History',
                value: `🎯 MVP CLASSIFICATION: ${mvpData.description}`
            });
        }
        
        const result = await this.robustApiCall('PATCH', url, operations);
        
        if (result.success) {
            return {
                success: true,
                id: workItemId,
                message: 'MVP classification updated successfully',
                url: `${this.baseUrl}/_workitems/edit/${workItemId}`
            };
        }
        
        return { success: false, id: workItemId, error: result.error };
    }
}

async function updateMVPPrioritization() {
    const azure = new RobustAzureDevOps();
    
    console.log('🎯 Robust MVP Prioritization Update Starting...\n');
    
    // MVP Classification Data
    const mvpClassifications = [
        // BASIC VERSION (Phase 1 - Launch May 2026)
        {
            id: 15, // US016: Basic Event Creation Workflow
            phase: 'Basic Version',
            priority: 1,
            tags: ['basic-version', 'phase-1', 'must-have', 'launch-critical', 'sprint-1-2'],
            description: 'Basic Version: Post events with key data and image (≤5 steps)',
            iteration: 'Sprint 1-2'
        },
        {
            id: 19, // US020: Basic Event Search
            phase: 'Basic Version',
            priority: 1,
            tags: ['basic-version', 'phase-1', 'must-have', 'launch-critical', 'sprint-3'],
            description: 'Basic Version: Search events (≤3 steps)',
            iteration: 'Sprint 3'
        },
        {
            id: 20, // US021: Event Filtering by Type & Category
            phase: 'Basic Version',
            priority: 1,
            tags: ['basic-version', 'phase-1', 'must-have', 'launch-critical', 'sprint-4'],
            description: 'Basic Version: Filter events by type and category',
            iteration: 'Sprint 4'
        },
        
        // MVP ENHANCEMENT (Phase 2)
        {
            id: 16, // US017: Event Information Management & Editing
            phase: 'MVP Enhancement',
            priority: 2,
            tags: ['mvp-enhancement', 'phase-2', 'should-have', 'sprint-5'],
            description: 'MVP Enhancement: Edit posted events with real-time updates',
            iteration: 'Sprint 5'
        },
        
        // POST-MVP (Future Iterations)
        {
            id: 17, // US018: Event Lifecycle Management
            phase: 'Post-MVP',
            priority: 3,
            tags: ['post-mvp', 'phase-3', 'could-have', 'backlog', 'future'],
            description: 'Post-MVP: Delete, archive, duplicate events',
            iteration: 'Backlog'
        },
        {
            id: 18, // US019: Progressive Enhancement for Event Details
            phase: 'Post-MVP',
            priority: 3,
            tags: ['post-mvp', 'phase-3', 'could-have', 'backlog', 'future'],
            description: 'Post-MVP: Advanced event details features',
            iteration: 'Backlog'
        },
        {
            id: 21, // US022: Advanced Search with Progressive Enhancement
            phase: 'Post-MVP',
            priority: 3,
            tags: ['post-mvp', 'phase-3', 'could-have', 'backlog', 'future'],
            description: 'Post-MVP: Advanced search with saved preferences',
            iteration: 'Backlog'
        }
    ];
    
    const results = [];
    
    // Step 1: Verify all work items exist
    console.log('🔍 Step 1: Verifying all User Stories exist...');
    for (const item of mvpClassifications) {
        const workItem = await azure.getWorkItem(item.id);
        if (workItem.success) {
            console.log(`✅ US#${item.id}: ${workItem.title} (${workItem.state})`);
        } else {
            console.log(`❌ US#${item.id}: ${workItem.error}`);
        }
        results.push({ ...workItem, mvpPhase: item.phase });
    }
    
    // Step 2: Update MVP classifications
    console.log('\n🔧 Step 2: Applying MVP classifications...');
    const updateResults = [];
    
    for (const item of mvpClassifications) {
        console.log(`\n🔄 Updating US#${item.id} (${item.phase})...`);
        
        const updateResult = await azure.updateWorkItemMVP(item.id, {
            tags: item.tags,
            priority: item.priority,
            description: item.description
        });
        
        updateResults.push({
            ...updateResult,
            phase: item.phase,
            iteration: item.iteration
        });
        
        if (updateResult.success) {
            console.log(`✅ US#${item.id}: ${item.description}`);
        } else {
            console.log(`❌ US#${item.id}: ${updateResult.error}`);
        }
    }
    
    // Step 3: Generate summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 ROBUST MVP PRIORITIZATION SUMMARY');
    console.log('═'.repeat(80));
    
    const successful = updateResults.filter(r => r.success);
    const failed = updateResults.filter(r => !r.success);
    
    console.log(`✅ Successfully updated: ${successful.length}/${mvpClassifications.length} User Stories`);
    console.log(`❌ Failed: ${failed.length}/${mvpClassifications.length} User Stories`);
    
    if (successful.length > 0) {
        console.log('\n🎯 SUCCESSFULLY CLASSIFIED BY PHASE:');
        
        const basicVersion = successful.filter(r => r.phase === 'Basic Version');
        const mvpEnhancement = successful.filter(r => r.phase === 'MVP Enhancement');
        const postMVP = successful.filter(r => r.phase === 'Post-MVP');
        
        if (basicVersion.length > 0) {
            console.log('\n📱 BASIC VERSION (Launch May 2026) - 7 Story Points:');
            basicVersion.forEach(r => console.log(`   ✅ US#${r.id}: Priority 1, Launch Critical`));
        }
        
        if (mvpEnhancement.length > 0) {
            console.log('\n🚀 MVP ENHANCEMENT (Phase 2) - 2 Story Points:');
            mvpEnhancement.forEach(r => console.log(`   ✅ US#${r.id}: Priority 2, Should Have`));
        }
        
        if (postMVP.length > 0) {
            console.log('\n📋 POST-MVP (Future) - 4 Story Points:');
            postMVP.forEach(r => console.log(`   ✅ US#${r.id}: Priority 3, Could Have`));
        }
    }
    
    if (failed.length > 0) {
        console.log('\n❌ FAILED UPDATES (Investigate):');
        failed.forEach(r => console.log(`   • US#${r.id}: ${r.error}`));
    }
    
    console.log('\n🎯 MVP SPRINT ROADMAP:');
    console.log('   📅 Sprint 1-2: US#15 - Basic Event Creation (3 pts)');
    console.log('   📅 Sprint 3: US#19 - Basic Event Search (2 pts)');
    console.log('   📅 Sprint 4: US#20 - Event Filtering (2 pts)');
    console.log('   📅 Sprint 5: US#16 - Event Editing (2 pts)');
    console.log('   📅 Backlog: US#17, US#18, US#21 - Post-MVP features');
    
    console.log('\n🏆 SUCCESS METRICS READY FOR TRACKING:');
    console.log('   • Village adoption (≥60% of 150 residents)');
    console.log('   • QR code scan rates from village boards');
    console.log('   • Events posted in app vs traditional channels');
    console.log('   • User & poster satisfaction surveys');
    
    return {
        totalProcessed: mvpClassifications.length,
        successful: successful.length,
        failed: failed.length,
        results: updateResults
    };
}

// Execute robust MVP update
if (require.main === module) {
    updateMVPPrioritization().then((summary) => {
        console.log(`\n🏁 Robust MVP prioritization complete: ${summary.successful}/${summary.totalProcessed} successful`);
        if (summary.failed === 0) {
            console.log('🎉 ALL USER STORIES SUCCESSFULLY CLASSIFIED FOR MVP!');
        }
    }).catch((error) => {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = { RobustAzureDevOps, updateMVPPrioritization };