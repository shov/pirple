/**
 * Configurations
 */

const environments = {};

environments.staging = {
    ports: { http: 3000, https: 3001 },
    name: 'staging',
};

environments.production = {
    ports: { http: 5000, https: 5001 },
    name: 'production',
};

const defaultEnvironmentKit = environments.staging;


const currentEnvironmentName = String(process.env.NODE_ENV || '');

let currentEnvironmentKit = defaultEnvironmentKit;

if (currentEnvironmentName in environments && 'object' === typeof environments[currentEnvironmentName]) {
    currentEnvironmentKit = environments[currentEnvironmentName];
}

module.exports = currentEnvironmentKit;