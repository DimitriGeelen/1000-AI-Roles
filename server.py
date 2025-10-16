#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import glob
from urllib.parse import urlparse, parse_qs

PORT = 8083

class FileServerHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        # Serve the HTML file
        if parsed_path.path == '/' or parsed_path.path == '/role-editor-enhanced.html':
            self.serve_file('role-editor-enhanced.html')
        
        # API endpoint to get all MD files
        elif parsed_path.path == '/api/files':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            files_data = self.get_all_md_files()
            self.wfile.write(json.dumps(files_data).encode())
        
        # API endpoint to get file content
        elif parsed_path.path == '/api/file':
            query_params = parse_qs(parsed_path.query)
            file_path = query_params.get('path', [''])[0]
            
            if file_path and os.path.exists('.' + file_path):
                self.send_response(200)
                self.send_header('Content-type', 'text/plain; charset=utf-8')
                self.end_headers()
                
                with open('.' + file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                self.wfile.write(content.encode('utf-8'))
            else:
                self.send_error(404)
        
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path == '/api/save':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            file_path = '.' + data.get('path', '')
            content = data.get('content', '')
            
            if file_path and os.path.exists(file_path):
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode())
            else:
                self.send_error(404)
    
    def serve_file(self, filename):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        with open(filename, 'rb') as f:
            self.wfile.write(f.read())
    
    def get_all_md_files(self):
        categories = {
            'Core Documentation': [],
            'Project Files': [],
            'Role Commands': []
        }
        
        # Get all MD files
        md_files = glob.glob('**/*.md', recursive=True)
        
        for file_path in md_files:
            if 'node_modules' in file_path:
                continue
                
            file_info = {
                'name': os.path.basename(file_path),
                'path': '/' + file_path,
                'type': self.get_file_type(file_path),
                'preview': self.get_file_preview(file_path)
            }
            
            # Categorize files
            if file_path.startswith('.claude/commands/'):
                categories['Role Commands'].append(file_info)
            elif file_path in ['README.md', 'CLAUDE.md', 'AI-Roles.md', 'core-principles.md', 'CHANGELOG.md']:
                categories['Core Documentation'].append(file_info)
            else:
                categories['Project Files'].append(file_info)
        
        # Convert to expected format
        result = []
        for category, files in categories.items():
            if files:
                result.append({
                    'category': category,
                    'files': sorted(files, key=lambda x: x['name'])
                })
        
        return result
    
    def get_file_type(self, file_path):
        if 'AI-Roles.md' in file_path:
            return 'roles'
        elif file_path.startswith('.claude/commands/'):
            return 'command'
        elif file_path in ['project-brief.md', 'mvp-requirements.md', 'architecture.md', 'pseudo-code.md', 'evidence-tests.md']:
            return 'project'
        else:
            return 'doc'
    
    def get_file_preview(self, file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                # Try to find a good preview line
                for line in lines[:10]:
                    line = line.strip()
                    if line and not line.startswith('#') and len(line) > 20:
                        return line[:80] + '...' if len(line) > 80 else line
                return 'Markdown documentation file'
        except:
            return 'File preview not available'

# Start server
with socketserver.TCPServer(("", PORT), FileServerHandler) as httpd:
    print(f"Server running at http://localhost:{PORT}")
    print(f"Open http://localhost:{PORT}/role-editor-enhanced.html in your browser")
    httpd.serve_forever()