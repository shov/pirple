/*
 * Definitions of routes
 */

const Router = require('./lib/Router');
const routes = new Router();

routes.setHandler('sample', (data, cb) => {
    cb(406, { name: 'smaple route' });
});

module.exports = routes;