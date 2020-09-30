/**
 * Router class
 */
class Router {
    constructor() {
        this._handlers = new Map();
    };


    static crudHandlerGenerator(entityName) {
        const controller = require(`../http/${entityName}Controller`);
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
    }

    setHandler(expression, handler) {
        this._handlers.set(expression, handler);
        return this;
    };

    getHandler(expression) {
        return this._handlers.has(expression) ? this._handlers.get(expression) : this._notFoundHandler;
    };

    _notFoundHandler(data, cb) {
        cb(404);
    };
};

module.exports = Router;