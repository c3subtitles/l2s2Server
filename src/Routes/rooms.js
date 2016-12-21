// @flow
import _ from 'lodash';
import { getCurrentUserFromSession } from '../Services/users';
import { getUsersInRoom, joinRoom, getLinesForRoom } from '../Services/rooms';
import RoomModel from 'Model/RoomModel';
import Router from 'koa-router';

const router = new Router();

router.get('/api/rooms', async(ctx) => {
  ctx.body = await RoomModel.fetchAll();
  ctx.status = 200;
}).put('/api/rooms/:id', async(ctx) => {
  const user = await getCurrentUserFromSession(ctx);
  const dbRoom = await RoomModel.where({ id: ctx.params.id }).fetch();
  if (!dbRoom) {
    throw new Error('Invalid Room');
  }
  const room = ctx.request.body;
  const role = await user.role();
  if ((dbRoom.get('name') !== room.name && !role.get('canCreateRoom')) || (dbRoom.get('locked') !== room.locked && !role.get('canLock')) || (dbRoom.get('speechLocked') !== room.speechLocked && !role.get('canSpeechLock'))) {
    throw new Error('insufficent Permission');
  }
  await dbRoom.save(ctx.request.body);
  _.each(global.primus.connections, s => {
    s.emit('roomUpdate', dbRoom);
  });
  ctx.body = dbRoom;
  ctx.status = 200;
}).post('/api/rooms', async(ctx) => {
  const user = await getCurrentUserFromSession(ctx);
  const role = await user.role();
  if (!role.get('canCreateRoom')) {
    throw new Error('insufficent Permission');
  }
  const { room } = ctx.request.body;
  const dbRoom = await new RoomModel({ name: room.name }).save();
  ctx.body = dbRoom;
  ctx.status = 200;
}).delete('/api/rooms/:id', async(ctx) => {
  const user = await getCurrentUserFromSession(ctx);
  const role = await user.role();
  if (!role.get('canDeleteRoom')) {
    throw new Error('insufficent Permission');
  }
  const room = await RoomModel.where({ id: ctx.params.id }).fetch();
  if (!room) {
    throw new Error('invalid Room id');
  }
  await room.destroy();
  ctx.status = 200;
}).get('/api/rooms/:id/join', async(ctx) => {
  const user = await getCurrentUserFromSession(ctx);
  const room = await RoomModel.where({ id: ctx.params.id }).fetch();
  if (!room) {
    throw new Error('invalid Room');
  }
  const role = await user.role();
  if (room.locked && !role.get('canJoinLocked')) {
    throw new Error('insufficent Permission');
  }
  joinRoom(room.id, user.id);
  ctx.body = {
    ...await getUsersInRoom(room.id),
    room,
  };
  ctx.status = 200;
}).get('/api/rooms/:id/joinRead', async(ctx) => {
  ctx.body = {
    room: await RoomModel.where({ id: ctx.params.id }).fetch(),
    lines: getLinesForRoom(Number.parseInt(ctx.params.id, 10)),
  };
  ctx.status = 200;
});

koa.use(router.routes());
