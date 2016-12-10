// @flow
import { getUserForSessionId } from '../Services/users';
import RoleModel from 'Model/RoleModel';
import Router from 'koa-router';

const router = new Router();

router.get('/api/roles', async (ctx) => {
  await getUserForSessionId(ctx.request.headers.sessionid);
  const roles = await RoleModel.fetchAll();
  ctx.body = roles.map(r => ({
    id: r.id,
    name: r.get('name'),
  }));
})
;

koa.use(router.routes());
