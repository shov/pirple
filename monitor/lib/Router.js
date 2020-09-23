/**
 * Router class
 */
class Router {
    constructor() {
        this._handlers = new Map();
    };

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