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
     * @param {string} tokenId 
     * @return {Promise<boolean>}
     */
    async verify(phone, tokenId) {
        if(!tokenId) {
            return false;
        }
        
        try {
            const dto = await this._storage.read(tokenId);
            return dto.phone === phone && parseInt(dto.expires) > +new Date();
        } catch (e) {
            return false;
        }
    }

    /**
     * Extract phone from token
     * @param {string} tokenId 
     * @return {Promise<boolean|string>}
     */
    async extract(tokenId) {
        if(!tokenId) {
            return false;
        }
        
        try {
            const dto = await this._storage.read(tokenId);
            return dto.phone
        } catch (e) {
            return false;
        }
    }
};
