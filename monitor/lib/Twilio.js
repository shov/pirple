/**
 * Twilio integration
 */

const Validator = require('./Validator');
const config = require('../config');
const querystring = require('querystring');
const https = require('https');

class Twilio {
    async sendSMS(phone, message) {
        if (!Validator.nonEmptyString(phone)) {
            throw new TypeError('Invalid phone!');
        }

        if (!Validator.nonEmptyString(message) || message.trim().length > 1600) {
            throw new TypeError('Invalid message!');
        }

        const payload = {
            "From": config.twilio.from,
            "To": phone.trim(),
            "Body": message.trim(),
        };

        const stringPayload = querystring.stringify(payload);
        const requestDetails = {
            "protocol": "https:",
            "hostname": "api.twilio.com",
            "method": "post",
            "path": `/2010-04-01/Accounts/${config.twilio.sid}/Messages.json`,
            "auth": `${config.twilio.sid}:${config.twilio.token}`,
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Lenght": Buffer.byteLength(stringPayload),
            },
        };

        await new Promise((resolve, reject) => {
            const req = https.request(requestDetails, (res) => {
                if ([200, 201].includes(res.statusCode)) {
                    resolve();
                    return;
                }

                const err = new Error(`Can't send SMS to ${phone.trim()}`);
                err.twilio = {
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage,
                };
                reject(err);
            });

            req.on('error', (err) => {
                reject(err);
            });

            req.write(stringPayload);
            req.end();
        });
    }
}

module.exports = Twilio