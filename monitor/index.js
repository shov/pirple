const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const FrontController = require('./lib/FrontController');

const config = require('./config');
const routes = require('./routes');
const frontController = new FrontController(routes);

//Server
http
    .createServer(frontController.getHandler())
    .listen(config.ports.http, () => {
        console.log(`HTTP server is lisstening on ${config.ports.http} in ${config.name} mode.`);
    });

https
    .createServer({
        key: fs.readFileSync(path.join(__dirname, './ssl/key.pem')),
        cert: fs.readFileSync(path.join(__dirname, './ssl/cert.pem')),
    }, frontController.getHandler())
    .listen(config.ports.https, () => {
        console.log(`HTTPS server is lisstening on ${config.ports.https} in ${config.name} mode.`);
    });