/**
 * Main module
 */
const Server = require('./lib/Server');
const WorkersManager = require('./lib/WorkersManager');

class App {
    constructor() {
        this._server = new Server();
        this._workersManager = new WorkersManager();
    }

    init() {
        this._server.init();
        this._workersManager.init();

        return this;
    }
};

const app = new App();

module.exports = app.init();