const Validator = require('../lib/Validator');
const FileDataStorage = require('../lib/FileDataStorage');
const helpers = require('../lib/helpers');
const TokenService = require('../app/TokensService');

class TokensController {
    constructor() {
        this._storage = new FileDataStorage().usePartition('tokens');
        this._userStorage = new FileDataStorage().usePartition('users');
        this._tokenService = new TokenService();
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
            !Validator.nonEmptyString(payload.phone)
            || !Validator.nonEmptyString(payload.password)
        ) {
            throw new Error(`Missing required fields!`);
        }

        const {phone, password,} = payload

        const passwordHash = helpers.hash(password);
        if (!passwordHash) {
            throw new Error(`Can't create password hash!`);
        }

        try {
            const userDto = await this._userStorage.read(phone);
            
            if(userDto.passwordHash !== passwordHash) {
                return { code: 401, payload: { error: `Wrong phone / password couple` } };
            }

            const tokenId = helpers.randonString(20);
            const tokenDto = {
                id: tokenId,
                phone,
                expires: +new Date() + 1000 * 60 * 60,
            };

            const wasCreated = await this._tokenService.create(tokenId, tokenDto);
            return wasCreated ? {code: 201, payload: tokenDto} : {code: 500, payload: {error: `Can't create token!`}};
        } catch (e) {
            return { code: 404, payload: { error: `User not found` } };
        }
    };

    /**
     * @param {RequestDataInterface} data 
     */
    async get(data) {
        if (!Validator.nonEmptyString(data.query.id) || data.query.id.trim().length < 20) {
            throw new TypeError(`Missing required fields!`);
        }

        try {
            const dto = await this._storage.read(data.query.id.trim());

            if (!dto) {
                return { code: 500, error: "Unexpected data" };
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
        if (!Validator.nonEmptyString(data.payload)) {
            throw new TypeError(`Wrong payload!`);
        }
        const payload = JSON.parse(data.payload);

        if (!Validator.nonEmptyString(payload.id) || payload.id.trim().length !== 20) {
            throw new TypeError(`id is absent or invalid`);
        }

        const tokenId = payload.id.trim();

        if (!Validator.boolean(payload.extend) || payload.extend !== true) {
            throw new TypeError(`extend is not true or invalid`);
        }

        let dto;
        try {
            dto = await this._storage.read(tokenId);
        } catch (e) {
            return { code: 404 };
        }

        dto.expires = +new Date() + 1000 * 60 * 60;

        try {
            await this._storage.update(tokenId, dto);
        } catch (e) {
            console.error(e, e.stack);
            throw Error(`Cannot update the token`);
        }

        return { code: 204 };
    };

    /**
     * @param {RequestDataInterface} data 
     */
    async delete(data) {
        if (!Validator.nonEmptyString(data.query.id) || data.query.id.trim().length < 20) {
            throw new TypeError(`Missing required fields!`);
        }

        const wasDeleted = await this._tokenService.delete(data.query.id.trim());
        return wasDeleted ? { code: 204 } : { code: 404 };
    };

};

module.exports = new TokensController();