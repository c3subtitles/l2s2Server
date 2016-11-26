// @flow
import { getUserForSessionId } from '../Services/users';
import { Role } from '../models';
import Router from 'koa-router';

const router = new Router();

router.get('/api/roles', async (ctx) => {
  await getUserForSessionId(ctx.request.headers.sessionid);
  const roles = await Role.find();
  ctx.body = roles.map(r => ({
    id: r.id,
    name: r.name,
  }));
})
;

koa.use(router.routes());
