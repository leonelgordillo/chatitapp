require('dotenv').config();
const bunyan = require('bunyan')

const loggers = {
    development: () => bunyan.createLogger({ name: 'development', level: 'debug' }),
    production: () => bunyan.createLogger({ name: 'production', level: 'info' }),
    test: () => bunyan.createLogger({ name: 'test', level: 'fatal' }),
};

const env = process.env.NODE_ENV; // 'dev' or 'test'

const development = {
    app: {
        port: parseInt(process.env.DEV_APP_PORT) || 3000
    },
    db: {
        connectionString: process.env.DEV_CONN_STRING_MONGO
    },
    redis: {
        host: process.env.DEV_REDIS_HOST || '127.0.0.1',
        port: process.env.DEV_REDIS_PORT || 6379
    },
    log: loggers.development,
};

const test = {
    app: {
        port: parseInt(process.env.TEST_APP_PORT) || 3000
    },
    db: {
        connectionString: process.env.TEST_CONN_STRING_MONGO
    },
    redis: {
        host: process.env.TEST_REDIS_HOST || '127.0.0.1',
        port: process.env.TEST_REDIS_PORT || 6379
    },
    log: loggers.test,
};

const production = {
    app: {
        port: parseInt(process.env.PROD_APP_PORT) || 3000
    },
    db: {
        connectionString: process.env.PROD_CONN_STRING_MONGO
    },
    redis: {
        host: process.env.PROD_REDIS_HOST || '127.0.0.1',
        port: process.env.PROD_REDIS_PORT || 6379
    },
    log: loggers.production,

}

const config = {
    development,
    test,
    production,
};

module.exports = config[env];