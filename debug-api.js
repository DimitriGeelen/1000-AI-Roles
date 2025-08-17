#!/usr/bin/env node
// Debug Azure DevOps API to find root cause of 404 errors

const axios = require('axios');
require('dotenv').config();

async function debugAPI() {
    const organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
    const project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
    const pat = process.env.AZURE_DEVOPS_PAT;
    
    if (!pat) {
        throw new Error('AZURE_DEVOPS_PAT environment variable is required');
    }
    
    const auth = Buffer.from(`:${pat}`).toString('base64');
    
    console.log('🔍 Testing Azure DevOps API access...');
    console.log(`📍 Organization: ${organization}`);
    console.log(`📂 Project: ${project}`);
    console.log(`🔑 PAT: ${pat.substring(0, 10)}...`);
    
    // Test 1: Basic API access with different URL patterns
    const testWorkItemId = 15; // US016: Basic Event Creation Workflow
    
    const urlPatterns = [
        // Pattern 1: With project in path
        `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/${testWorkItemId}`,
        // Pattern 2: Without project in path
        `https://dev.azure.com/${organization}/_apis/wit/workitems/${testWorkItemId}`,
        // Pattern 3: Using different domain
        `https://${organization}.visualstudio.com/_apis/wit/workitems/${testWorkItemId}`,
        // Pattern 4: Using different domain with project
        `https://${organization}.visualstudio.com/${project}/_apis/wit/workitems/${testWorkItemId}`
    ];
    
    const apiVersions = ['7.1-preview.3', '7.0', '6.0', '5.1'];
    
    for (const baseUrl of urlPatterns) {
        for (const apiVersion of apiVersions) {
            const url = `${baseUrl}?api-version=${apiVersion}`;
            
            try {
                console.log(`\n🔄 Testing: ${url}`);
                
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                });
                
                console.log(`✅ SUCCESS! Status: ${response.status}`);
                console.log(`📋 Work Item State: ${response.data.fields['System.State']}`);
                console.log(`📋 Work Item Title: ${response.data.fields['System.Title']}`);
                console.log(`🎯 WORKING URL PATTERN: ${baseUrl}`);
                console.log(`🎯 WORKING API VERSION: ${apiVersion}`);
                
                // Test update operation on this working URL
                console.log(`\n🔧 Testing UPDATE operation...`);
                const updateUrl = `${baseUrl}?api-version=${apiVersion}`;
                
                const updateOperations = [
                    {
                        op: 'add',
                        path: '/fields/System.Tags',
                        value: 'mvp-test, basic-version, phase-1'
                    }
                ];
                
                const updateResponse = await axios.patch(updateUrl, updateOperations, {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/json-patch+json'
                    },
                    timeout: 10000
                });
                
                console.log(`✅ UPDATE SUCCESS! Status: ${updateResponse.status}`);
                console.log(`📋 Updated Tags: ${updateResponse.data.fields['System.Tags'] || 'none'}`);
                
                return {
                    success: true,
                    workingUrl: baseUrl,
                    workingApiVersion: apiVersion,
                    workItemState: response.data.fields['System.State'],
                    workItemTitle: response.data.fields['System.Title']
                };
                
            } catch (error) {
                console.log(`❌ FAILED: ${error.response?.status || error.code} - ${error.message}`);
                if (error.response?.data) {
                    console.log(`📄 Error details: ${JSON.stringify(error.response.data)}`);
                }
            }
        }
    }
    
    console.log('\n💥 No working URL pattern found!');
    return { success: false };
}

// Run the debug
debugAPI().then((result) => {
    if (result.success) {
        console.log('\n🎉 ROOT CAUSE IDENTIFIED AND FIXED!');
        console.log(`✅ Working URL: ${result.workingUrl}`);
        console.log(`✅ Working API Version: ${result.workingApiVersion}`);
    } else {
        console.log('\n🚨 UNABLE TO IDENTIFY WORKING PATTERN');
    }
}).catch((error) => {
    console.error('💥 Debug failed:', error.message);
});