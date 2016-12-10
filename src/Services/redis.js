// @flow
/* eslint camelcase: 0 */
import RedisSessions from 'redis-sessions';
import redis from 'redis';
import UserModel from 'Model/UserModel';

const redisOptions = {
  enable_offline_queue: false,
  path: undefined,
  port: undefined,
  host: undefined,
};
if (process.env.REDIS_PATH) {
  redisOptions.path = process.env.REDIS_PATH;
} else {
  redisOptions.host = process.env.REDIS_HOST;
  redisOptions.port = process.env.REDIS_PORT;
}
export const redisClient = redis.createClient(redisOptions);
const app = 'L2S2-TEST';
const rs = new RedisSessions({
  client: redisClient,
});

export async function createSession(userId: number): Promise<string> {
  const result = await rs.createAsync({
    app,
    id: userId,
    ip: 'undefined',
    ttl: 3600,
  });
  return result.token;
}

export async function getUserForSessionFromRedis(token: string) {
  const { id } = await rs.getAsync({
    app,
    token,
  });
  if (id) {
    return UserModel.where({ id }).fetch();
  }
  return Promise.resolve();
}

export async function deleteSessionForUser(user: UserModel): Promise<any> {
  await rs.killsoidAsync({
    app,
    id: user.id,
  });
}

export async function deleteSession(token: string): Promise<void> {
  await rs.killAsync({
    app,
    token,
  });
}
