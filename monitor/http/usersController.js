const Validator = require('../lib/Validator');
const FileDataStorage = require('../lib/FileDataStorage');
const helpers = require('../lib/helpers');
const AuthService = require('../lib/AuthService');
const UserService = require('../app/UsersService');

class UsersController {
    constructor() {
        this._storage = new FileDataStorage().usePartition('users');
        this._auth = new AuthService();
        this._userService = new UserService();
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
            !Validator.nonEmptyString(payload.firstName)
            || !Validator.nonEmptyString(payload.lastName)
            || !Validator.nonEmptyString(payload.phone
                || payload.phone.trim().length < 10)
            || !Validator.nonEmptyString(payload.password)
            || payload.tosAgreement !== true
        ) {
            throw new Error(`Wrong payload!`);
        }

        const { firstName, lastName, phone, password, tosAgreement } = payload

        const passwordHash = helpers.hash(password);
        if (!passwordHash) {
            throw new Error(`Can't create password hash!`);
        }

        try {
            await this._storage.read(phone);
            return {
                code: 404, payload: { error: 'User with this phone already exists' }
            };

        } catch (e) {
            await this._storage.create(payload.phone, {
                firstName, lastName, phone, passwordHash, tosAgreement, tokens: [],
            });
            return { code: 201, payload: { phone } };
        }
    };

    /**
     * @param {RequestDataInterface} data 
     */
    async get(data) {
        if (!Validator.nonEmptyString(data.query.phone) || data.query.phone.trim().length < 10) {
            throw new TypeError(`Wrong payload!`);
        }

        const phone = data.query.phone.trim();
        const tokenId = Validator.nonEmptyString(data.headers.authorization) ? data.headers.authorization.trim() : false;
        if(!await this._auth.verify(phone, tokenId)) {
            return {code: 403};
        }

        try {
            const dto = await this._storage.read(phone);

            if (!dto) {
                return { code: 500, error: "Unexpected data" };
            }
            delete dto.tokens;
            delete dto.passwordHash;
            return { code: 200, payload: dto };

        } catch (e) {
            return { code: 404 };
        }
    };

    /**
     * @param {RequestDataInterface} data 
     */
    async update(data) {
        if (!Validator.nonEmptyString(data.payload)) {
            throw new TypeError(`Wrong payload!`);
        }
        const payload = JSON.parse(data.payload);

        if (!Validator.nonEmptyString(payload.phone) && !Validator.nonEmptyString(payload.phone.trim())) {
            throw new TypeError(`Phone is required`);
        }

        const haveSomeToUpdate =
            Validator.nonEmptyString(payload.firstName)
            || Validator.nonEmptyString(payload.lastName)
            || Validator.nonEmptyString(payload.password);

        if (!haveSomeToUpdate) {
            throw new TypeError(`Nothing to update`);
        }

        const phone = payload.phone.trim();
        const tokenId = Validator.nonEmptyString(data.headers.authorization) ? data.headers.authorization.trim() : false;
        if(!await this._auth.verify(phone, tokenId)) {
            return {code: 403};
        }


        const {firstName, lastName, password } = payload;

        let dto;
        try {
            dto = await this._storage.read(phone);
        } catch (e) {
            return { code: 404 };
        }

        if (firstName) {
            dto.firstName = firstName;
        }

        if (lastName) {
            dto.lastName = lastName;
        }

        if (password) {
            dto.passwordHash = helpers.hash(password);
        }

        try {
            await this._storage.update(phone, dto);
        } catch (e) {
            console.error(e, e.stack);
            throw Error(`Cannot update the user`);
        }

        return { code: 204 };
    };

    /**
     * @param {RequestDataInterface} data 
     */
    async delete(data) {
        if (!Validator.nonEmptyString(data.query.phone)) {
            throw new TypeError(`Wrong payload!`);
        }

        const phone = data.query.phone.trim();
        const tokenId = Validator.nonEmptyString(data.headers.authorization) ? data.headers.authorization.trim() : false;
        if(!await this._auth.verify(phone, tokenId)) {
            return {code: 403};
        }

        const wasDeleted = await this._userService.delete(phone);
        return wasDeleted ? { code: 204 } : { code: 404 };
    };

};

module.exports = new UsersController();