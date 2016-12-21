// @flow
import { login, logout, checkPassword, register, getUsers, resetPassword, getCurrentUserFromSession } from '../Services/users';
import UserModel from 'Model/UserModel';
import OneTimeTokenModel from 'Model/OneTimeTokenModel';
import { createSession, deleteSessionForUser } from '../Services/redis';
import Router from 'koa-router';

const router = new Router();


router.post('/api/login', async (ctx) => {
  const { username, password } = ctx.request.body;
  const { user, sessionId } = await login(username, password);
  ctx.body = {
    sessionId,
    user: await user.client(),
  };
})
.post('/api/userForSessionId', async (ctx) => {
  const user = await getCurrentUserFromSession(ctx);
  ctx.body = await user.client();
})
.post('/api/userForToken', async ctx => {
  const token = await OneTimeTokenModel.where({
    token: ctx.request.body.token,
  }).fetch();
  if (token) {
    const user = await token.user().fetch();
    if (!user) {
      return;
    }
    const sessionId = await createSession(user.id);
    ctx.body = {
      user,
      sessionId,
    };
    ctx.status = 200;
    await token.destroy();
  } else {
    throw new Error('Invalid Token, please request anotehr token.');
  }
})
.post('/api/logout', (ctx) => {
  if (ctx.request.headers.sessionid) {
    logout(ctx.request.headers.sessionid);
  }
  ctx.status = 200;
})
.post('/api/changePassword', async (ctx) => {
  const { oldPassword, newPassword } = ctx.request.body;
  const user = await getCurrentUserFromSession(ctx);
  const correctOld = await checkPassword(oldPassword, user);
  if (!correctOld) {
    throw new Error('Old Password is incorrect');
  }
  const cryptedPw = await global.encrypt(newPassword);
  await user.save({
    password: cryptedPw,
  });
  ctx.status = 200;
})
.post('/api/register', async (ctx) => {
  const { username, password, email } = ctx.request.body;
  if (!username || !password || !email) {
    throw new Error('Please fill out all fields.');
  }
  await register(username, password, email);
  ctx.status = 200;
})
.get('/api/users', async (ctx) => {
  await getCurrentUserFromSession(ctx);
  ctx.body = await getUsers();
})
.put('/api/users/:id', async (ctx) => {
  const ownUser = await getCurrentUserFromSession(ctx);
  const user = ctx.request.body;
  if (user.hasOwnProperty('active') && !ownUser.role.canActivateUser) {
    throw new Error('insufficent permissions');
  }
  if (user.hasOwnProperty('role') && !ownUser.role.canChangeUserRole) {
    throw new Error('insufficent permissions');
  }
  const dbUser = await UserModel.where({
    id: Number.parseInt(ctx.params.id, 10),
  }).save(user);
  if (!user.active) {
    deleteSessionForUser(user);
  }
  ctx.body = await dbUser.client();
  ctx.status = 200;
})
.delete('/api/users/:id', async (ctx) => {
  const ownUser = await getCurrentUserFromSession(ctx);
  if (!ownUser.role.canDeleteUser) {
    throw new Error('insufficent permissions');
  }
  await UserModel.where({
    id: ctx.params.id,
  }).destroy();
  ctx.status = 200;
})
.post('/api/users/resetPassword', async (ctx) => {
  const user = await UserModel.where({
    email: ctx.request.body.email,
  }).fetch();
  ctx.status = 200;
  if (!user) {
    return;
  }
  resetPassword(user);
})
.get('/api/stats', async (ctx) => {
  const ownUser = await getCurrentUserFromSession(ctx);
  const role = await ownUser.role().fetch();
  if (!role || role.id !== 1) {
    throw new Error('insufficent permissions');
  }
  ctx.body = `${Object.keys(global.primus.connections).length} Clients`;
  ctx.status = 200;
});

koa.use(router.routes());
