const http = require('http');
const FrontController = require('./lib/FrontController');

const routes = require('./routes');
const frontController = new FrontController(routes);

//Server
http
    .createServer(frontController.getHandler())
    .listen(3000, () => {
        console.log('Lisstening on 3000...');
    });
