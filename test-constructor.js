#!/usr/bin/env node
// Simple test to verify the constructor works

console.log('🔍 Testing Azure DevOps Planner constructor...');

try {
    const AzureDevOpsPlanner = require('./scripts/azure-devops-planner-impl.js');
    console.log('✅ Module loaded successfully');
    console.log('📋 Type:', typeof AzureDevOpsPlanner);
    
    const planner = new AzureDevOpsPlanner();
    console.log('✅ Constructor works successfully');
    console.log('📋 Instance type:', typeof planner);
    console.log('📋 Has processCommand method:', typeof planner.processCommand);
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
}

console.log('🏁 Constructor test complete');