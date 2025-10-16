#!/bin/bash

echo "🚀 Launching Enhanced Role Editor..."
echo "📚 This editor includes ALL markdown files in the repository"
echo ""
echo "Files included:"
echo "✅ Core Documentation: README.md, CLAUDE.md, AI-Roles.md, etc."
echo "✅ Project Files: architecture.md, pseudo-code.md, evidence-tests.md, etc."
echo "✅ Role Commands: All .claude/commands/*.md files"
echo ""
echo "🌐 Starting server on http://localhost:8083"
echo "🔧 Use Ctrl+C to stop the server"
echo ""

python3 server.py