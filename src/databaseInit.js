// @flow
import Knex from 'knex';

const config: any = {
  client: process.env.DB_CLIENT || 'pg',
  connection: {
    /* eslint-disable */
    application_name: 'l2s2',
    /* eslint-enable */
    host: process.env.DB_CONNECTION_HOST || '192.168.2.119',
    user: process.env.DB_CONNECTION_USER || 'sysdba',
    password: process.env.DB_CONNECTION_PASSWORD || 'sasa',
    database: process.env.DB_CONNECTION_DATABASE || 'factroDev2',
    charset: process.env.DB_CONNECTION_CHARSET || 'utf8',
  },
  searchPath: process.env.DB_SEARCHPATH || 'knex,public',
  pool: {
    min: process.env.DB_POOL_MIN || 1,
    max: process.env.DB_POOL_MAX || 10,
  },
};

const Bookshelf = require('bookshelf');

global.knex = Knex(config);
global.bookshelf = Bookshelf(knex);
