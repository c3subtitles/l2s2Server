// @flow
import _ from 'lodash';
import { getCurrentUserFromSession } from '../Services/users';
import { getUsersInRoom, joinRoom, getLinesForRoom } from '../Services/rooms';
import { Room } from '../models';
import Router from 'koa-router';

const router = new Router();

router.get('/api/rooms', async (ctx) => {
  ctx.body = await Room.find();
  ctx.status = 200;
})
.put('/api/rooms/:id', async (ctx) => {
  const user = await getCurrentUserFromSession(ctx);
  const dbRoom: RoomType = await Room.findOne({ id: ctx.params.id });
  if (!dbRoom) {
    throw new Error({ message: 'Invalid Room' });
  }
  const room = ctx.request.body;
  if (
    (dbRoom.name !== room.name && !user.role.canCreateRoom) ||
    (dbRoom.locked !== room.locked && !user.role.canLock) ||
    (dbRoom.speechLocked !== room.speechLocked && !user.role.canSpeechLock)
  ) {
    throw new Error({ message: 'insufficent Permission' });
  }
  Object.assign(dbRoom, ctx.request.body);
  // $FlowFixMe
  await dbRoom.save();
  _.each(global.primus.connections, s => {
    s.emit('roomUpdate', dbRoom);
  });
  ctx.body = dbRoom;
  ctx.status = 200;
})
.post('/api/rooms', async (ctx) => {
  const user = await getCurrentUserFromSession(ctx);
  if (!user.role.canCreateRoom) {
    throw new Error({ message: 'insufficent Permission' });
  }
  const { room } = ctx.request.body;
  const dbRoom = await Room.create({ name: room.name });
  ctx.body = dbRoom;
  ctx.status = 200;
})
.delete('/api/rooms/:id', async (ctx) => {
  const user = await getCurrentUserFromSession(ctx);
  if (!user.role.canDeleteRoom) {
    throw new Error({ message: 'insufficent Permission' });
  }
  const room = await Room.findOne({ id: ctx.params.id });
  if (!room) {
    throw new Error({ message: 'invalid Room id' });
  }
  await room.destroy();
  ctx.status = 200;
})
.get('/api/rooms/:id/join', async (ctx) => {
  const user: ClientUser = await getCurrentUserFromSession(ctx);
  const room: RoomType = await Room.findOne({ id: ctx.params.id });
  if (!room) {
    throw new Error({ message: 'invalid Room' });
  }
  if (room.locked && !user.role.canJoinLocked) {
    throw new Error({ message: 'insufficent Permission' });
  }
  joinRoom(room.id, user.id);
  ctx.body = {
    ...await getUsersInRoom(room.id),
    room,
  };
  ctx.status = 200;
})
.get('/api/rooms/:id/joinRead', async (ctx) => {
  ctx.body = {
    room: await Room.findOne({ id: ctx.params.id }),
    lines: getLinesForRoom(Number.parseInt(ctx.params.id, 10)),
  };
  ctx.status = 200;
})
;

koa.use(router.routes());
