const Validator = require('../lib/Validator');
const FileDataStorage = require('../lib/FileDataStorage');

class UsersController {
    constructor() {
        this._storage = new FileDataStorage().usePartition('users');
    }

    /**
     * @param {RequestDataInterface} data 
     */
    async create(data) {
        if (!Validator.nonEmptyString(data.payload)) {
            throw new TypeError(`Wrong payload!`)
        }
        const payload = JSON.parse(data.payload);

        if (
            !Validator.nonEmptyString(payload.firstName)
            || !Validator.nonEmptyString(payload.lastName)
            || !(Validator.nonEmptyString(payload.phone) && payload.phone.trim().length === 10)
            || !Validator.nonEmptyString(payload.password)
            || !(payload.tosAgreement === true)
        ) {
            throw new Error(`Wrong payload!`)
        }

        const { firstName, lastName, phone, passwordHash, tosAgreement } = payload

        try {
            this._storage.read(phone);
            return {
                code: 404, payload: { error: 'User with this phone already exists' }
            };

        } catch (e) {
            await this._storage.create(payload.phone, {
                firstName, lastName, phone, passwordHash, tosAgreement,
            });
            return { code: 201, payload: { phone } };
        }
    };

    async get(data) {

    };

    async update(data) {

    };

    async delete(data) {

    };

};

module.export = new UsersController();