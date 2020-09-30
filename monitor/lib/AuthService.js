/**
 * Authentication, verifying tokens
 */
const FileDataStorage = require('./FileDataStorage');

module.exports = class AuthService {

    constructor() {
        this._storage = new FileDataStorage().usePartition('tokens');
    }

    /**
     * Verify a token for phone
     * @param {string} phone 
     * @param {string} tockenId 
     * @return {Promise<boolean>}
     */
    async verify(phone, tockenId) {
        try {
            const dto = await this._storage.read(tockenId);
            return dto.phone === phone && parseInt(dto.expires) > +new Date();
        } catch (e) {
            return false;
        }
    }
};
