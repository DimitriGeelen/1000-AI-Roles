#!/usr/bin/env node
// Check if tags were actually applied to work items

const axios = require('axios');
require('dotenv').config();

async function checkTags() {
    const organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
    const project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
    const pat = process.env.AZURE_DEVOPS_PAT;
    const auth = Buffer.from(`:${pat}`).toString('base64');
    
    const userStoryIds = [15, 16, 17, 18, 19, 20, 21];
    
    console.log('🔍 Checking MVP tags in Azure DevOps...\n');
    
    for (const id of userStoryIds) {
        try {
            const url = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/${id}?api-version=7.1-preview.3`;
            
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Accept': 'application/json'
                }
            });
            
            const workItem = response.data;
            const title = workItem.fields['System.Title'];
            const tags = workItem.fields['System.Tags'] || 'NO TAGS';
            const priority = workItem.fields['Microsoft.VSTS.Common.Priority'] || 'No Priority';
            const state = workItem.fields['System.State'];
            
            console.log(`📋 US#${id}: ${title}`);
            console.log(`   🎯 Priority: ${priority}`);
            console.log(`   📊 State: ${state}`);
            console.log(`   🏷️ Tags: ${tags}`);
            console.log(`   🔗 Direct Link: https://dev.azure.com/${organization}/${project}/_workitems/edit/${id}`);
            console.log('');
            
        } catch (error) {
            console.log(`❌ US#${id}: Error - ${error.message}`);
        }
    }
}

checkTags();