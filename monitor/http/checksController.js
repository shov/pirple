const Validator = require('../lib/Validator');
const FileDataStorage = require('../lib/FileDataStorage');
const helpers = require('../lib/helpers');
const ChecksService = require('../app/ChecksService');
const AuthService = require('../lib/AuthService');
const NotFoundError = require('../app/NotFoundError');
const MaxChecksError = require('../app/MaxChecksError');
const config = require('../config');

class ChecksController {
    constructor() {
        this._storage = new FileDataStorage().usePartition('checks');
        this._userStorage = new FileDataStorage().usePartition('users');
        this._checksService = new ChecksService();
        this._auth = new AuthService();
    }

    /**
     * @param {RequestDataInterface} data 
     */
    async create(data) {
        if (!Validator.nonEmptyString(data.payload)) {
            throw new TypeError(`Wrong payload!`);
        }
        const payload = JSON.parse(data.payload);

        if (
            !Validator.allowedString(payload.protocol, ['http', 'https'])
            || !Validator.nonEmptyString(payload.url)
            || !Validator.allowedString(payload.method, ['get', 'post', 'put', 'delete'])
            || !Validator.nonEmptyArray(payload.successCodes)
            || !Validator.wholeNumber(payload.timeoutSeconds, 1, 5)
        ) {
            throw new Error(`Missing required fields!`);
        }

        const protocol = payload.protocol.trim();
        const url = payload.url.trim();
        const method = payload.method.trim();
        const successCodes = payload.successCodes;
        const timeoutSeconds = payload.timeoutSeconds;

        const tokenId = Validator.nonEmptyString(data.headers.authorization) ? data.headers.authorization.trim() : false;
        const phone = await this._auth.extract(tokenId);

        if (!phone) {
            return { code: 403 };
        }

        const checkId = helpers.randonString(20);
        const checkDto = {
            id: checkId,
            protocol,
            url,
            method,
            successCodes,
            timeoutSeconds,
            phone,
        };

        try {
            await this._checksService.create(checkId, checkDto);
            return { code: 201, payload: {
                id: checkId,
                ...checkDto
            } };
        } catch (e) {
            if (e instanceof NotFoundError) {
                return { code: 404 };
            } else if (e instanceof MaxChecksError) {
                return { code: 400, payload: { error: `Max checks count is reached ${config.maxChecks}` } };
            } else {
                throw e
            }
        }
    };

    /**
     * @param {RequestDataInterface} data 
     */
    async get(data) {
        if (!Validator.nonEmptyString(data.query.id) || data.query.id.trim().length < 20) {
            throw new TypeError(`Missing required fields!`);
        }

        const id = data.query.id.trim()

        try {
            const dto = await this._storage.read(data.query.id.trim());

            if (!dto) {
                return { code: 500, error: "Unexpected data" };
            }

            const phone = dto.phone;
            const tokenId = Validator.nonEmptyString(data.headers.authorization) ? data.headers.authorization.trim() : false;
            if(!await this._auth.verify(phone, tokenId)) {
                return {code: 403};
            }

            return { code: 200, payload: dto };

        } catch (e) {
            return { code: 404 };
        }
    };

    /**
     * used to extend the expiration
     * @param {RequestDataInterface} data 
     */
    async update(data) {
       
    };

    /**
     * @param {RequestDataInterface} data 
     */
    async delete(data) {
       
    };

};

module.exports = new ChecksController();