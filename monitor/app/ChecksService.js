/**
 * Checks service
 */

const FileDataStorage = require('../lib/FileDataStorage');
const NotFoundError = require('./NotFoundError');
const MaxChecksError = require('./MaxChecksError');
const config = require('../config');

class ChecksService {
    constructor() {
        this._storage = new FileDataStorage().usePartition('checks');
        this._userStorage = new FileDataStorage().usePartition('users');
    }

    async create(checkId, checkDto) {
        let userDto;
        try {
            userDto = await this._userStorage.read(checkDto.phone);
        } catch (e) {
            throw new NotFoundError();
        }

        if (userDto.checks.length > config.maxChecks) {
            throw new MaxChecksError();
        }

        await this._storage.create(checkId, checkDto);
        try {
            await this._storage.linkToOwner(checkId, 'phone', 'users', 'checks');
        } catch (e) {
            await this._storage.delete(checkId);
            throw new NotFoundError();
        }
    }

    async delete(checkId) {
        try {
            await this._storage.deleteFromOwner(checkId, 'phone', 'users', 'checks');
            await this._storage.delete(checkId);

        } catch (e) {
            return false;
        }

        return true;
    }
};

module.exports = ChecksService;