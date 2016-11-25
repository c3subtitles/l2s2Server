/* @flow */
import bcrypt from 'bcryptjs';
import bluebird from 'bluebird';
import http from 'http';
import koa from 'koa';
import koaJSON from 'koa-json-body';
import path from 'path';
import Primus from 'primus';
import redis from 'redis';
import RedisSessions from 'redis-sessions';
import router from 'koa-66';
import UUID from 'uuid-js';

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

UUID.create = (function(old) {
  return function() {
    const uuid = old.apply(this, arguments);
    return uuid.hex;
  };
}(UUID.create));

global.Promise = bluebird;


global.app = new koa();
const server = http.createServer(global.app.callback());
const options = {
  transformer: 'engine.io',
  compression: true,
};
global.router = new router();

global.primus = new Primus(server, options);
global.primus.plugin('emit', require('primus-emit'));
global.primus.plugin('rooms', require('primus-rooms'));

global.primus.on('connection', require('./primus/connections').onConnection);
global.primus.save(path.resolve('./primusClient.js'));

require('./routes.js');

global.app
.use(koaJSON())
.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    console.error(e.stack);
    ctx.body = e;
    ctx.status = 500;
  }
})
.use(global.router.routes());

// require ('./fahrplan/parse');
server.listen(process.env.PORT || 9500);
