// @flow
import bcrypt from 'bcrypt';
import bluebird from 'bluebird';
import http from 'http';
import koa from 'koa';
import koaBodyParser from 'koa-bodyparser';
import path from 'path';
import Primus from 'primus';
import redis from 'redis';
import RedisSessions from 'redis-sessions';

require('./flowWorkarounds');

global.encrypt = function(value) {
  return new Promise(resolve => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(value, salt, (err, hash) => {
        resolve(hash);
      });
    });
  });
};

bluebird.promisifyAll(RedisSessions.prototype);
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

global.Promise = bluebird;

require('./databaseInit');

global.koa = new koa();
const server = http.createServer(global.koa.callback());
const options = {
  transformer: 'engine.io',
  compression: true,
};

global.primus = new Primus(server, options);
global.primus.plugin('emit', require('primus-emit'));
global.primus.plugin('rooms', require('primus-rooms'));

global.primus.on('connection', require('./primus/connections').onConnection);
global.primus.save(path.resolve('./primusClient.js'));


global.koa
.use(koaBodyParser())
.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    /* eslint-disable */
    console.error(e.stack);
    /* eslint-enable */
    ctx.body = e;
    ctx.status = 500;
  }
});
require('./Routes');
// require ('./fahrplan/parse');
server.listen(process.env.PORT || 9500);
