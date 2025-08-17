#!/usr/bin/env node
// Universal script runner that handles path resolution automatically
// Usage: node run-script.js <script-name> [args...]

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

function findScriptPath(scriptName) {
    const currentDir = process.cwd();
    
    // Add .js extension if not present
    if (!scriptName.endsWith('.js')) {
        scriptName += '.js';
    }
    
    // Possible locations to check
    const possiblePaths = [
        // Current directory
        path.join(currentDir, scriptName),
        // Scripts subdirectory from current
        path.join(currentDir, 'scripts', scriptName),
        // Parent directory
        path.join(currentDir, '..', scriptName),
        // Parent scripts directory
        path.join(currentDir, '..', 'scripts', scriptName),
        // Project root detection
        path.join(currentDir, '../../scripts', scriptName)
    ];
    
    for (const scriptPath of possiblePaths) {
        if (fs.existsSync(scriptPath)) {
            return scriptPath;
        }
    }
    
    return null;
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.error('❌ Usage: node run-script.js <script-name> [args...]');
        console.error('');
        console.error('📋 Available scripts:');
        
        // List available scripts
        const scriptsDir = path.join(__dirname);
        const scripts = fs.readdirSync(scriptsDir)
            .filter(file => file.endsWith('.js') && file !== 'run-script.js')
            .map(file => file.replace('.js', ''));
        
        scripts.forEach(script => {
            console.error(`   • ${script}`);
        });
        
        process.exit(1);
    }
    
    const scriptName = args[0];
    const scriptArgs = args.slice(1);
    
    console.log(`🔍 Looking for script: ${scriptName}`);
    console.log(`📍 Current directory: ${process.cwd()}`);
    
    const scriptPath = findScriptPath(scriptName);
    
    if (!scriptPath) {
        console.error(`❌ Script '${scriptName}' not found!`);
        console.error('');
        console.error('🔍 Searched in:');
        console.error(`   • Current directory: ${process.cwd()}`);
        console.error(`   • Scripts subdirectory: ${path.join(process.cwd(), 'scripts')}`);
        console.error(`   • Parent directory: ${path.join(process.cwd(), '..')}`);
        process.exit(1);
    }
    
    console.log(`✅ Found script: ${scriptPath}`);
    console.log(`🚀 Executing: node ${scriptPath} ${scriptArgs.join(' ')}`);
    console.log('─'.repeat(80));
    
    // Execute the script
    const child = spawn('node', [scriptPath, ...scriptArgs], {
        stdio: 'inherit',
        cwd: path.dirname(scriptPath)
    });
    
    child.on('close', (code) => {
        process.exit(code);
    });
    
    child.on('error', (error) => {
        console.error(`❌ Failed to execute script: ${error.message}`);
        process.exit(1);
    });
}

if (require.main === module) {
    main();
}