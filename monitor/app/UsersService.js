/**
 * Users servcie
 */

const FileDataStorage = require('../lib/FileDataStorage');

class UsersService {
    constructor() {
        this._usersStorage = new FileDataStorage().usePartition('users');
        this._tokensStorage = new FileDataStorage().usePartition('tokens');
    }

    /**
     * Delete a user
     * @param {string} phone 
     */
    async delete(phone) {
        //Delete the user
        try {
            await this._usersStorage.delete(phone);
        } catch (e) {
            return false;
        }

        //Clean up related tokens
        this._tokensStorage.removeRelated('users', 'phone', phone)
            .catch(e => {
                console.error(`Cannot remove user's tokens!`, e, e.stack);
            })

        return true;
    }
};

module.exports = UsersService;