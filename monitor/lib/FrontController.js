/**
 * Handles any response and sends it to the right route handler
 */

const { URL, URLSearchParams } = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

class FrontController {
    constructor(routes) {
        this._routes = routes;
    }

    getHandler() {
        return async (req, res) => {

            //Collecting req data
            const url = new URL(req.url, `http://${req.headers.host}`);
            const requestedPath = url.pathname.replace(new RegExp('^\/+|\/+$', 'g'), '');
            const method = req.method.toLowerCase()
            const query = new URLSearchParams(url.search)

            const decoder = new StringDecoder('utf-8');
            let buffer = '';
            req.on('data', data => {
                buffer += decoder.write(data);
            });

            //Handle the request
            req.on('end', () => {
                buffer += decoder.end();

                const reqHandler = this._routes.getHandler(requestedPath)
                reqHandler({
                    path: requestedPath,
                    method,
                    query: this._prepareQueryObject(query),
                    payload: buffer,
                }, (code, payload) => {
                    const statusCode = typeof code === 'number' ? code : 200;
                    const payloadString = JSON.stringify(typeof payload === 'object' ? payload : {});

                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(statusCode);
                    res.end(payloadString);
                })

            });
        };
    };

    /**
     * Helper, parses req query params
     * @param {URLSearchParams} query 
     */
    _prepareQueryObject(query) {
        if (!query instanceof URLSearchParams) {
            throw new TypeError('!URLSearchParams');
        }

        const o = {};
        for (const key of query.keys()) {
            const all = query.getAll(key);

            if (all.length > 1) {
                o[key] = all;
            } else {
                o[key] = query.get(key)
            }
        }
        return o;
    };
};

module.exports = FrontController;