/*
 * Definitions of routes
 */

const Router = require('./lib/Router');
const routes = new Router();

routes.setHandler('users', (() => {
    const controller = require('./http/usersController');
    const actions = {
        get: controller.get.bind(controller),
        post: controller.create.bind(controller),
        put: controller.update.bind(controller),
        delete: controller.delete.bind(controller),
    };

    //Handler
    return (data, cb) => {

        if (!data.method in actions) {
            cb(405);
        }

        actions[data.method](data)
            .then(({ code, payload }) => {
                cb(code, payload);
            })
            .catch(err => {
                if (err instanceof TypeError) {
                    cb(422, { message: err.toString() });
                } else {
                    cb(500, { message: err.toString(), stack: err.stack });
                }
            });
    };
})());

routes.setHandler('ping', (data, cb) => {
    cb(200);
});

routes.setHandler('hello', (data, cb) => {
    cb(200, { message: 'Hello Pirple!' });
});

module.exports = routes;