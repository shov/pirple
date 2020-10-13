/**
 * Main module
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const FrontController = require('./lib/FrontController');

const config = require('./config');
const routes = require('./routes');
const frontController = new FrontController(routes);

//HTTP Server
http
    .createServer(frontController.getHandler())
    .listen(config.ports.http, () => {
        console.log(`HTTP server is lisstening on ${config.ports.http} in ${config.name} mode.`);
    });

//HTTPS Server
const sslKeyPath = path.join(__dirname, './ssl/key.pem');
const sslCertPath = path.join(__dirname, './ssl/cert.pem');

let sslOptions = null;

try {
    sslOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath),
    }
} catch (e) {
    console.warn(`Cannot read SSL key either cert: `, e.message);
}

if (sslOptions) {
    https
        .createServer(sslOptions, frontController.getHandler())
        .listen(config.ports.https, () => {
            console.log(`HTTPS server is lisstening on ${config.ports.https} in ${config.name} mode.`);
        });
}