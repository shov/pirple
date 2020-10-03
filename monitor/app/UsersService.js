/**
 * Users servcie
 */

const FileDataStorage = require('../lib/FileDataStorage');

class UsersService {
    constructor() {
        this._storage = new FileDataStorage().usePartition('users');
    }

    /**
     * Delete a user
     * @param {string} phone 
     */
    async delete(phone) {
        try {
            try {
                //Clean up related tokens
                await this._storage.deleteOwned(phone, 'tokens', 'tokens');
            } catch (e) {
                console.error(`Cannot remove user's tokens!`, e, e.stack);
                throw e;
            }

            //Delete the user
            await this._storage.delete(phone);
            
        } catch (e) {
            return false;
        }
        return true;
    }
};

module.exports = UsersService;