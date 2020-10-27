/**
 * Workers Manager
 */
const path = require('path');
const fs = require('fs');
const FileDataStorage = require('./FileDataStorage');
const https = require('https');
const http = require('http');
const url = require('url');
const typeValidator = require('./Validator');
const { type } = require('os');
const { URL, URLSearchParams } = require('url');
const Twilio = require('./Twilio');

class WorkersManager {
    constructor() {
        this._loopInteraval = null;
        this.LOOPING_TERM = 60 * 1000;
        this._storage = new FileDataStorage().usePartition('checks');
        this._twilio = new Twilio();
    }

    init() {
        this.gatherAllChecks().catch(e => {
            console.warn(`Something wrong with the checks`, e, e.stack);
        })

        this.loop();
    }

    loop() {
        this._loopInteraval = setInterval(() => {
            this.gatherAllChecks().catch(e => {
                console.warn(`Something wrong with the checks`, e, e.stack);
            })
        }, this.LOOPING_TERM);
    }

    async gatherAllChecks() {
        const checks = await this._storage.list();
        if (checks.length < 1) {
            console.info(`No checks to validate.`);
            return;
        }

        checks.forEach(checkName => {
            this._storage.read(checkName)
                .then(checkDto => {
                    this.validate(checkDto).catch(e => {
                        console.error(`Cannot run validation for a check of ${checkName}`, e, e.stack);
                    })
                })
                .catch(e => {
                    console.error(`Cannot process a check of ${checkName}`, e, e.stack);
                });
        });
    }

    async validate(checkDto) {
        if (!typeValidator.object(checkDto) || null === checkDto) {
            checkDto = {}
        };

        if (
            !typeValidator.nonEmptyString(checkDto.id) || checkDto.id.length !== 20
            || !typeValidator.allowedString(checkDto.protocol, ['http', 'https'])
            || !typeValidator.nonEmptyString(checkDto.url)
            || !typeValidator.allowedString(checkDto.method, ['get', 'post', 'put', 'delete'])
            || !typeValidator.nonEmptyArray(checkDto.successCodes)
            || !typeValidator.wholeNumber(checkDto.timeoutSeconds, 1, 5)
        ) {
            throw new Error(`Check is corrupted!`);
        }

        checkDto.protocol = checkDto.protocol.trim();
        checkDto.url = checkDto.url.trim();
        checkDto.method = checkDto.method.trim();
        checkDto.successCodes = checkDto.successCodes;
        checkDto.timeoutSeconds = checkDto.timeoutSeconds;

        checkDto.state = !typeValidator.allowedString(checkDto.state, ['up', 'down']) ? 'down' : checkDto.state;
        checkDto.lastChecked = !typeValidator.wholeNumber(checkDto.lastChecked, -1) ? false : checkDto.lastChecked;

        await this.performCheck(checkDto);
    }

    async performCheck(checkDto) {
        const checkOutcome = {
            error: false,
            responseCode: false,
        };
        let outcomeSent = false;

        const url = new URL(`${checkDto.protocol}://${checkDto.url}`);
        const requestPath = url.pathname;
        const method = checkDto.method.toUpperCase();
        const query = url.search;

        const requestDetails = {
            protocol: checkDto.protocol + ':',
            hostname: url.hostname,
            method,
            path: requestPath + query,
            timeout: checkDto.timeoutSeconds * 1000,
        };

        const gateway = checkDto.method === 'http' ? http : https;
        const req = gateway.request(requestDetails, res => {
            checkOutcome.responseCode = res.statusCode;
            if (!outcomeSent) {
                this.processCheckOutcome(checkDto, checkOutcome).catch(e => {
                    console.warn(`Can't process check outcome! Could be successful`);
                });
                outcomeSent = true;
            }
        });

        req.on('error', err => {
            checkOutcome.error = {
                error: true,
                value: err,
            };

            if (!outcomeSent) {
                this.processCheckOutcome(checkDto, checkOutcome).catch(e => {
                    console.warn(`Can't process check outcome! Must be failed`);
                });
                outcomeSent = true;
            }
        });

        req.on('timeout', err => {
            checkOutcome.error = {
                error: true,
                value: 'timeout',
            };

            if (!outcomeSent) {
                this.processCheckOutcome(checkDto, checkOutcome).catch(e => {
                    console.warn(`Can't process check outcome! Must be timeouted`);
                });
                outcomeSent = true;
            }
        });

        req.end();
    }

    async processCheckOutcome(checkDto, outcome) {
        const newState = !outcome.error && outcome.responseCode && !checkDto.successCodes.includes(outcome.responseCode) ? 'up' : 'down';

        const toNotify = checkDto.lastChecked && newState !== checkDto.state;

        const updatedDto = {
            ...checkDto, state: newState, lastChecked: Date.now(),
        };

        await this._storage.update(checkDto.id, updatedDto);

        console.log(`Check ${checkDto.id} processed${toNotify ? ', user to be notified on ' + checkDto.phone : ''}`);

        if (toNotify) {
            try {
                await this.notifyUser(updatedDto);
            } catch (e) {
                console.error(`SMS wasn't send`, e, e.stack);
            }
        }
    }

    async notifyUser(checkDto) {
        const msg = `Alert: your check ${checkDto.method.toUpperCase()} ${checkDto.protocol}://${checkDto.url} is now ${checkDto.state}`;
        await this._twilio.sendSMS(checkDto.phone, msg);
    }
};

module.exports = WorkersManager;