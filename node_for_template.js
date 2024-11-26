const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    // If the request is for the HTML file
    if (req.url === '/template.html') {
        const filePath = path.join(__dirname, 'template.html');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Error loading template.html');
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(data);
            }
        });
    }
    // If the request is for the CSS file
    else if (req.url === '/stylesheet.css') {
        const filePath = path.join(__dirname, 'stylesheet.css');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Error loading styles.css');
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/css');
                res.end(data);
            }
        });
    }
    // If the request is for the logo.png file
    else if (req.url === '/logo2.png') {
        const filePath = path.join(__dirname, 'logo2.png');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Error loading logo2.png');
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'image/png');
                res.end(data);
            }
        });
    } 
    else {
        // 404 for any other request
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Page not found');
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
