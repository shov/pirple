/**
 * Configurations
 */

const { env } = require("process");

const environments = {};

environments.staging = {
    ports: { http: 3000, https: 3001 },
    name: 'staging',
    hashSecret: '1g5hq3uy3a6hys467kj4ahq3h35h3',
    maxChecks: 5,
    twilio: {
        from: process.env.TWILIO_FROM || null,
        sid: process.env.TWILIO_SID || null,
        token: process.env.TWILIO_TOKEN || null,
    },
};

environments.production = {
    ports: { http: 5000, https: 5001 },
    name: 'production',
    hashSecret: '45yv3w5yvw35hvw35g3rgcw46jw4b',
    maxChecks: 5,
    twilio: {
        from: process.env.TWILIO_FROM || null,
        sid: process.env.TWILIO_SID || null,
        token: process.env.TWILIO_TOKEN || null,
    },
};

const defaultEnvironmentKit = environments.staging;


const currentEnvironmentName = String(process.env.NODE_ENV || '');

let currentEnvironmentKit = defaultEnvironmentKit;

if (currentEnvironmentName in environments && 'object' === typeof environments[currentEnvironmentName]) {
    currentEnvironmentKit = environments[currentEnvironmentName];
}

module.exports = currentEnvironmentKit;