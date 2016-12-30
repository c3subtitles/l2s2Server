// @flow
import { getUserForSessionFromRedis, createSession, deleteSession } from './redis';
import UserModel from 'Model/UserModel';
import RoleModel from 'Model/RoleModel';
import OneTimeTokenModel from 'Model/OneTimeTokenModel';
import bcrypt from 'bcrypt';
import uuid from 'uuid';
import nodemailer from 'nodemailer';
import sparkPostTransport from 'nodemailer-sparkpost-transport';

function createNodemailTransport() {
  /* eslint-disable camelcase */
  return nodemailer.createTransport(sparkPostTransport({
    sparkPostApiKey: process.env.SPARKPOST_API_KEY,
    options: {
      open_tracking: true,
      click_tracking: true,
      transactional: true,
    },
    campaign_id: 'l2s2',
    content: {
      template_id: 'l2s2-password-reset',
    },
  }));
}

export async function resetPassword(user: UserModel) {
  let token = await OneTimeTokenModel.where({
    user: user.id,
  }).fetch();
  if (!token) {
    token = await new OneTimeTokenModel({
      user: user.id,
      token: uuid.v4(),
    }).save();
  }
  const transport = createNodemailTransport();
  transport.sendMail({
    substitution_data: {
      /* eslint-enable camelcase */
      user: {
        name: user.get('username'),
        passwordResetUrl: `${process.env.BASE_URL || ''}profile?token=${token.get('token')}`,
      },
    },
    recipients: [{
      address: {
        email: user.get('email'),
        name: user.get('username'),
      },
    }],
  }, (err, info) => {
    if (err) {
      // console.error(err);
    }
    if (info) {
      // console.log(info);
    }
  });
}

export function checkPassword(password: string, user: UserModel): Promise<bool> {
  return bcrypt.compare(password, user.get('password'));
}

export function getInactive(): Promise<UserModel.Collection> {
  return UserModel.where({
    active: false,
  }).fetchAll();
}
export function activateUser(user: UserModel, u: Object): Promise<UserModel> {
  if (!u.role.canActivateUser) {
    return Promise.reject(new Error('Insufficent Permission'));
  }
  return user.save({
    active: true,
  });
}

export async function getCurrentUserFromSession(ctx: Koa$Context): Promise<UserModel> {
  const user = await getUserForSessionId(ctx.request.headers.sessionid);
  if (!user) {
    throw new Error('Expired Session');
  }
  return user;
}

export function getUserForSessionId(sessionId: ?string) {
  if (sessionId) {
    return getUserForSessionFromRedis(sessionId);
  }
  return Promise.resolve();
}

export async function register(username: string, password: string, email: string): Promise<UserModel> {
  let user = await UserModel.where({ username }).fetch();
  if (user) {
    throw new Error('Username already in use');
  }
  const userRole = await RoleModel.where({ name: 'User' }).fetch();
  user = await new UserModel({
    username,
    password: await global.encrypt(password),
    email,
    role: userRole ? userRole.id : undefined,
  }).save();
  return user;
}

export async function login(username: string, password: string) {
  const user = await UserModel.where({ username }).fetch();
  if (!user || !await checkPassword(password, user)) {
    throw new Error('Username or password wrong');
  }
  if (!user.get('active')) {
    throw new Error(`${user.get('username')} is not active yet. Wait until you are activated.`);
  }
  const sessionId = await createSession(user.id);
  return { user, sessionId };
}

export function logout(sessionId: string) {
  deleteSession(sessionId);
}

export async function getUsers(): Promise<Array<UserModel>> {
  const users = await UserModel.fetchAll();
  return Promise.map(users.toArray(), user => user.client()).all();
}

export async function statistics() {
  const connections = Object.keys(global.primus.connections).length;
  const room1 = await knex('line')
  .select(knex.raw('count(text) as lines'), knex.raw('count(char_length(text)) as chars'))
  .where('room', 1)
  .first();
  const room2 = await knex('line')
  .select(knex.raw('count(text) as lines'), knex.raw('count(char_length(text)) as chars'))
  .where('room', 2)
  .first();
  return {
    connections,
    roomOne: room1,
    roomTwo: room2,
  };
}
