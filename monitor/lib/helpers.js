/**
 * Helpers
 */

const crypto = require('crypto');
const config = require('../config');

module.exports = {
    hash: (source) => {
        return crypto.createHmac('sha256', config.hashSecret).update(source).digest('hex');
    },

    randonString: (size) => {
        const pool = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let string = ''
        for(i = 1; i <= size; i ++) {
            string += pool[Math.floor(Math.random() * pool.length)];
        }

        return string;
    },
};