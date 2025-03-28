from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.request
import json
import sys

class ProxyHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path.startswith('/api/sheets'):
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Forward the request to Vercel
            req = urllib.request.Request(
                'https://combustible-tramec.vercel.app/api/sheets/',
                data=post_data,
                headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            )
            
            try:
                with urllib.request.urlopen(req) as response:
                    self.send_response(response.status)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    response_data = response.read()
                    print('API Response:', response_data.decode('utf-8'))  # Debug log
                    self.wfile.write(response_data)
            except urllib.error.HTTPError as e:
                self.send_response(e.code)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_data = e.read()
                print('API Error:', error_data.decode('utf-8'))  # Debug log
                self.wfile.write(error_data)
        else:
            super().do_POST(self)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept')
        self.end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = HTTPServer(('', port), ProxyHandler)
    print(f'Starting server on port {port}...')
    server.serve_forever() 