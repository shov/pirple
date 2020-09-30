/*
 * Definitions of routes
 */

const Router = require('./lib/Router');
const routes = new Router();

routes.setHandler('users', Router.crudHandlerGenerator('users'));

routes.setHandler('tokens', Router.crudHandlerGenerator('tokens'));

routes.setHandler('ping', (data, cb) => {
    cb(200);
});

routes.setHandler('hello', (data, cb) => {
    cb(200, { message: 'Hello Pirple!' });
});

module.exports = routes;