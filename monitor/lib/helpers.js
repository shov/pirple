/**
 * Helpers
 */

const crypto = require('crypto');
const config = require('../config');

module.exports = {
    hash: (source) => {
        return crypto.createHmac('sha256', config.hashSecret).update(source).digest('hex');
    }
};