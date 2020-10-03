/**
 * Tokens service
 */

const FileDataStorage = require('../lib/FileDataStorage');

class TokensService {
    constructor() {
        this._storage = new FileDataStorage().usePartition('tokens')
    }

    async create(tokenId, tokenDto) {
        try {
            await this._storage.create(tokenId, tokenDto);
            try {
                await this._storage.linkToOwner(tokenId, 'phone', 'users', 'tokens');
            } catch (e) {
                await this._storage.delete(tokenId);
            }
        } catch (e) {
            return false;
        }
        return true;
    }

    async delete(tokenId) {
        try {
            await this._storage.deleteFromOwner(tokenId, 'phone', 'users', 'tokens');
            await this._storage.delete(tokenId);
            
        } catch (e) {
            return false;
        }

        return true;
    }
};

module.exports = TokensService;