/* 
   CV Vibe - Zero-Dependency Local Dev Server
   Uses native Node.js HTTP libraries to serve CSS, HTML, and JS Modules 
   with exact MIME types. Bypasses execution policy restrictions.
*/

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Clean up query parameters or hashes from path
    const cleanUrl = req.url.split('?')[0].split('#')[0];
    let filePath = path.join(__dirname, cleanUrl);
    
    // Default directory index
    if (cleanUrl === '/' || cleanUrl.endsWith('/')) {
        filePath = path.join(filePath, 'index.html');
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 File Not Found - CV Vibe</h1><p>Check the path and try again.</p>', 'utf-8');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`<h1>500 Internal Error</h1><p>${error.code}</p>`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Content-Type-Options': 'nosniff' // Security best practice
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('\n=============================================');
    console.log('   CV Vibe - Premium Resume Builder');
    console.log('=============================================');
    console.log(`Server is running at: http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to shut down the server.');
    console.log('=============================================\n');
});
