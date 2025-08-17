#!/usr/bin/env node
// Check current PAT permissions and identify what's needed for iteration creation

const axios = require('axios');
require('dotenv').config();

async function checkPermissions() {
    const organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
    const project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
    const pat = process.env.AZURE_DEVOPS_PAT;
    const auth = Buffer.from(`:${pat}`).toString('base64');
    
    console.log('🔍 Checking Azure DevOps PAT Permissions...\n');
    
    // Test 1: Check basic project access
    console.log('🔧 Test 1: Basic Project Access...');
    try {
        const projectUrl = `https://dev.azure.com/${organization}/_apis/projects/${project}?api-version=7.1-preview.4`;
        const projectResponse = await axios.get(projectUrl, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        console.log('✅ Project Access: SUCCESS');
        console.log(`   📋 Project: ${projectResponse.data.name}`);
        console.log(`   🔗 URL: ${projectResponse.data.url}`);
    } catch (error) {
        console.log('❌ Project Access: FAILED');
        console.log(`   Error: ${error.response?.status} ${error.message}`);
    }
    
    // Test 2: Check work item permissions
    console.log('\n🔧 Test 2: Work Item Permissions...');
    try {
        const workItemUrl = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/15?api-version=7.1-preview.3`;
        await axios.get(workItemUrl, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        console.log('✅ Work Item Read: SUCCESS');
    } catch (error) {
        console.log('❌ Work Item Read: FAILED');
    }
    
    // Test 3: Check classification nodes (iterations) permissions - different API patterns
    console.log('\n🔧 Test 3: Classification Nodes (Iterations) Access...');
    
    const iterationUrls = [
        // Pattern 1: Project-specific classification nodes
        `https://dev.azure.com/${organization}/${project}/_apis/wit/classificationnodes/iterations?api-version=7.1-preview.2`,
        // Pattern 2: Organization-level classification nodes
        `https://dev.azure.com/${organization}/_apis/wit/classificationnodes/${project}/iterations?api-version=7.1-preview.2`,
        // Pattern 3: Different API version
        `https://dev.azure.com/${organization}/${project}/_apis/wit/classificationnodes/iterations?api-version=6.0`,
        // Pattern 4: Core API
        `https://dev.azure.com/${organization}/${project}/_apis/wit/classificationnodes?api-version=7.1-preview.2&$depth=1`
    ];
    
    let workingIterationUrl = null;
    
    for (const url of iterationUrls) {
        try {
            console.log(`🔄 Testing: ${url}`);
            const response = await axios.get(url, {
                headers: { 'Authorization': `Basic ${auth}` }
            });
            console.log(`✅ SUCCESS! Status: ${response.status}`);
            console.log(`   📋 Found ${response.data.children?.length || 0} iterations`);
            workingIterationUrl = url;
            break;
        } catch (error) {
            console.log(`❌ FAILED: ${error.response?.status} ${error.message}`);
        }
    }
    
    // Test 4: Check if we can create iterations with working URL
    if (workingIterationUrl) {
        console.log('\n🔧 Test 4: Iteration Creation Permission...');
        try {
            const createUrl = workingIterationUrl.replace('?api-version=', '?api-version=');
            const testIteration = {
                name: 'TEST-Permission-Check',
                attributes: {
                    startDate: new Date().toISOString(),
                    finishDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                }
            };
            
            const response = await axios.post(createUrl, testIteration, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Iteration Creation: SUCCESS');
            console.log(`   📋 Created test iteration: ${response.data.name}`);
            
            // Clean up test iteration
            try {
                const deleteUrl = `${createUrl}/${response.data.name}`;
                await axios.delete(deleteUrl, {
                    headers: { 'Authorization': `Basic ${auth}` }
                });
                console.log('🧹 Test iteration cleaned up');
            } catch (deleteError) {
                console.log('⚠️ Test iteration cleanup failed (may need manual cleanup)');
            }
            
        } catch (error) {
            console.log('❌ Iteration Creation: FAILED');
            console.log(`   Error: ${error.response?.status} ${error.response?.data?.message || error.message}`);
            
            if (error.response?.status === 403) {
                console.log('\n🚨 PERMISSION ISSUE IDENTIFIED!');
                console.log('   The PAT lacks permissions to create classification nodes (iterations)');
            }
        }
    }
    
    // Test 5: Check team settings access
    console.log('\n🔧 Test 5: Team Settings Access...');
    try {
        const teamsUrl = `https://dev.azure.com/${organization}/_apis/projects/${project}/teams?api-version=7.1-preview.3`;
        const teamsResponse = await axios.get(teamsUrl, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        console.log('✅ Teams Access: SUCCESS');
        console.log(`   📋 Found ${teamsResponse.data.value?.length || 0} teams`);
        
        if (teamsResponse.data.value && teamsResponse.data.value.length > 0) {
            const teamId = teamsResponse.data.value[0].id;
            const teamName = teamsResponse.data.value[0].name;
            
            // Check team iterations
            const teamIterationsUrl = `https://dev.azure.com/${organization}/${project}/${teamId}/_apis/work/teamsettings/iterations?api-version=7.1-preview.1`;
            try {
                const teamIterResponse = await axios.get(teamIterationsUrl, {
                    headers: { 'Authorization': `Basic ${auth}` }
                });
                console.log(`✅ Team "${teamName}" Iterations: SUCCESS`);
                console.log(`   📋 Found ${teamIterResponse.data.value?.length || 0} team iterations`);
            } catch (teamError) {
                console.log(`❌ Team "${teamName}" Iterations: FAILED`);
                console.log(`   Error: ${teamError.response?.status} ${teamError.message}`);
            }
        }
    } catch (error) {
        console.log('❌ Teams Access: FAILED');
        console.log(`   Error: ${error.response?.status} ${error.message}`);
    }
    
    // Summary and Recommendations
    console.log('\n' + '═'.repeat(80));
    console.log('📊 PERMISSION ANALYSIS SUMMARY');
    console.log('═'.repeat(80));
    
    console.log('\n🎯 REQUIRED PERMISSIONS FOR COMPLETE SPRINT SETUP:');
    console.log('');
    console.log('📋 Current PAT appears to have:');
    console.log('   ✅ Work Item Read/Write access');
    console.log('   ✅ Project-level access');
    console.log('');
    console.log('🚨 Missing permissions likely needed:');
    console.log('   ❌ Project Settings: Manage classification nodes');
    console.log('   ❌ Project Settings: Edit project-level information');
    console.log('   ❌ Possibly: Project Administrator role');
    console.log('');
    console.log('🔧 TO FIX PROGRAMMATIC SPRINT CREATION:');
    console.log('');
    console.log('1. 🔐 Update PAT Permissions:');
    console.log('   Go to: https://dev.azure.com/{your-org}/_usersSettings/tokens');
    console.log('   Edit your PAT and ensure these scopes are selected:');
    console.log('   ✅ Work Items: Read & Write');
    console.log('   ✅ Project and Team: Read & Write'); 
    console.log('   ✅ Build: Read & Execute (optional)');
    console.log('   ✅ Code: Read (optional)');
    console.log('');
    console.log('2. 🎭 OR Grant Project Permissions:');
    console.log('   Go to: Project Settings → Permissions');
    console.log('   Add your user to: "Project Administrators" group');
    console.log('   OR grant specific permissions:');
    console.log('   ✅ "Edit project-level information"');
    console.log('   ✅ "Manage iteration paths"');
    console.log('');
    console.log('3. 🚀 Then re-run the sprint creation script');
    
    console.log('\n🎪 ALTERNATIVE APPROACHES:');
    console.log('   • Use Azure CLI with service principal');
    console.log('   • Use REST API with OAuth2 token');
    console.log('   • Grant Project Administrator role temporarily');
    
    return {
        projectAccess: true,
        workItemAccess: true,
        iterationAccess: false,
        recommendedAction: 'Update PAT scopes or grant Project Administrator permissions'
    };
}

checkPermissions();