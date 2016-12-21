// @flow
import Router from 'koa-router';
import { currentTalk, nextTalk } from 'Fahrplan';

const router = new Router();

router.get('/api/currentTalk/:id', async (ctx) => {
  const talk = await currentTalk(Number.parseInt(ctx.params.id, 10));
  if (!talk) {
    ctx.status = 404;
    return;
  }
  ctx.body = talk;
  ctx.status = 200;
}).get('/api/nextTalk/:id', async (ctx) => {
  const talk = await nextTalk(Number.parseInt(ctx.params.id, 10));
  if (!talk) {
    ctx.status = 404;
    return;
  }
  ctx.body = talk;
  ctx.status = 200;
})
;

koa.use(router.routes());
