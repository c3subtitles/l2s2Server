// @flow
import Knex from 'knex';

const config: any = {
  client: process.env.DB_CLIENT || 'pg',
  connection: {
    /* eslint-disable */
    application_name: 'l2s2',
    /* eslint-enable */
    host: process.env.DB_CONNECTION_HOST,
    user: process.env.DB_CONNECTION_USER,
    password: process.env.DB_CONNECTION_PASSWORD,
    database: process.env.DB_CONNECTION_DATABASE,
    charset: 'utf8',
  },
  searchPath: 'knex,public',
  pool: {
    min: 1,
    max: 10,
  },
};

const Bookshelf = require('bookshelf');

global.knex = Knex(config);
global.bookshelf = Bookshelf(knex);
