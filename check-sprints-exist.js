#!/usr/bin/env node
// Check if the sprints actually exist in Azure DevOps

const axios = require('axios');
require('dotenv').config();

async function checkSprintsExist() {
    const organization = process.env.AZURE_DEVOPS_ORG || 'dimitri0310';
    const project = process.env.AZURE_DEVOPS_PROJECT || 'fnb-pricing';
    const pat = process.env.AZURE_DEVOPS_PAT;
    const auth = Buffer.from(`:${pat}`).toString('base64');
    
    console.log('🔍 Checking if sprints exist in Azure DevOps...\n');
    console.log(`📍 Organization: ${organization}`);
    console.log(`📂 Project: ${project}\n`);
    
    try {
        // Check iteration paths (sprints)
        const iterationsUrl = `https://dev.azure.com/${organization}/${project}/_apis/wit/classificationnodes/iterations?api-version=7.1-preview.2&$depth=2`;
        
        const response = await axios.get(iterationsUrl, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        
        const iterations = response.data.children || [];
        
        console.log(`📋 Found ${iterations.length} iterations in project:`);
        
        if (iterations.length === 0) {
            console.log('❌ NO SPRINTS FOUND!');
            console.log('\n🚨 PROBLEM: The sprint creation script did not actually create sprints');
            console.log('   This explains why you cannot see them in Azure DevOps');
        } else {
            console.log('');
            iterations.forEach((iteration, index) => {
                console.log(`${index + 1}. ${iteration.name}`);
                console.log(`   📍 Path: ${iteration.path}`);
                console.log(`   🆔 ID: ${iteration.id}`);
                if (iteration.attributes) {
                    console.log(`   📅 Start: ${iteration.attributes.startDate || 'Not set'}`);
                    console.log(`   📅 End: ${iteration.attributes.finishDate || 'Not set'}`);
                }
                console.log('');
            });
        }
        
        // Check for our specific MVP sprints
        const expectedSprints = [
            'MVP-Planning-Sprint',
            'Sprint-1-2-Event-Creation', 
            'Sprint-3-Event-Search',
            'Sprint-4-Event-Filtering',
            'MVP-Launch-Sprint',
            'Sprint-5-MVP-Enhancement',
            'Post-MVP-Backlog'
        ];
        
        console.log('🎯 Checking for expected MVP sprints:');
        let foundSprints = 0;
        
        expectedSprints.forEach(sprintName => {
            const found = iterations.find(iter => iter.name === sprintName);
            if (found) {
                console.log(`✅ ${sprintName}: FOUND`);
                foundSprints++;
            } else {
                console.log(`❌ ${sprintName}: NOT FOUND`);
            }
        });
        
        console.log(`\n📊 Sprint Status: ${foundSprints}/${expectedSprints.length} MVP sprints found`);
        
        if (foundSprints === 0) {
            console.log('\n🚨 DIAGNOSIS: Sprint creation completely failed');
            console.log('   The previous sprint creation scripts did not work');
            console.log('   Need to run proper sprint creation first');
        } else if (foundSprints < expectedSprints.length) {
            console.log('\n⚠️ DIAGNOSIS: Partial sprint creation');
            console.log('   Some sprints were created but not all');
            console.log('   Need to create missing sprints');
        } else {
            console.log('\n✅ DIAGNOSIS: All MVP sprints exist!');
            console.log('   Sprints are created - assignment issue is elsewhere');
        }
        
        return {
            totalIterations: iterations.length,
            mvpSprints: foundSprints,
            expectedSprints: expectedSprints.length,
            iterations: iterations
        };
        
    } catch (error) {
        console.error('❌ Failed to check sprints:', error.message);
        if (error.response) {
            console.error(`HTTP ${error.response.status}: ${error.response.statusText}`);
        }
        throw error;
    }
}

checkSprintsExist();