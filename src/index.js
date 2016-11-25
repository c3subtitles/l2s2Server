// @flow


/* istanbul ignore if */
if (process.env.NODE_ENV !== 'production') {
  require('source-map-support').install({
    environment: 'node',
    hookRequire: true,
  });
}
require('./app');
