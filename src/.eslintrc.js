module.exports = {
  extends: [
    'marudor/noReact',
  ],
  env: {
    node: true,
  },
  globals: {
    bookshelf: false,
    knex: false,
    koa: false,
    log: false,
    cache: false,
    __DEV__: false,
  },
  plugins: [
    'header',
  ],
  rules: {
    'header/header': [2, 'line', ' @flow'],
    curly: ['error', 'multi-line', 'consistent'],
  }
}
