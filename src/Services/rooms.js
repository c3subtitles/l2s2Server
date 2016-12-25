// @flow
import { Map, List } from 'immutable';
import UserModel from 'Model/UserModel';
import LineModel from 'Model/LineModel';
import RoomModel from 'Model/RoomModel';
import Crypto from 'crypto';

type RoomLine = {
  color: string,
  hash: string,
  text: string,
  timeout: any,
  userId: number,
};

type RoomUser = {
  id: number,
  currentLine: string,
};

type ClientRoom = {
  lines: List<RoomLine>,
  userIds: Map<number, RoomUser>,
};

let rooms: Map<number, ClientRoom> = Map();

export async function getUsersInRoom(roomId: number) {
  const { userIds, lines } = rooms.get(roomId);
  if (userIds) {
    const users = await Promise.map(userIds.toArray(), async u => {
      const user = await UserModel.where({
        id: u.id,
      }).fetch();
      if (user) {
        return {
          ...(await user.client()),
          current: u.currentLine,
        };
      }
    });
    return {
      userInRoom: users,
      lines: lines.takeLast(30).toArray(),
    };
  }
  return {
    userInRoom: [],
    lines: [],
  };
}

export function getLinesForRoom(roomId: number) {
  let room = rooms.get(roomId);
  if (!room) {
    room = {
      lines: List(),
      userIds: Map(),
    };
    rooms = rooms.set(roomId, room);
  }
  const refDate = new Date();
  return room.lines.takeLast(5).filter(l => l.timeout > refDate).map(l => ({
    text: l.text,
    timeout: l.timeout,
    hash: l.hash,
  })).toArray();
}

export function joinRoom(roomId: number, userId: number) {
  let room = rooms.get(roomId);
  if (!room) {
    room = {
      lines: List(),
      userIds: Map(),
    };
  }
  if (!room.userIds) {
    room.userIds = Map();
  }
  if (!room.userIds.has(userId)) {
    room.userIds = room.userIds.set(userId, {
      currentLine: '',
      id: userId,
    });
  }
  rooms = rooms.set(roomId, room);
}

export function leaveRoom(roomId: number, userId: number) {
  const room = rooms.get(roomId);
  if (room && room.userIds) {
    room.userIds = room.userIds.delete(userId);
    rooms = rooms.set(roomId, room);
  }
}

export function leaveAllRooms(userId: number, emitFn: ?Function) {
  rooms = rooms.map((room, roomId) => {
    if (room.userIds && room.userIds.has(userId)) {
      if (emitFn) {
        emitFn(roomId);
      }
      room.userIds = room.userIds.delete(userId);
    }
    return room;
  });
}


export function lineStart(text: string, userId: number, roomId: number) {
  try {
    const { userIds } = rooms.get(roomId);
    if (userIds) {
      const userInfo = userIds.get(userId);
      if (userInfo) {
        userInfo.currentLine = text;
      }
    }
  } catch (e) {
    /* ignored */
  }
}

async function addLineToDatabase(text, roomId, userId, color, hash) {
  try {
    const room = await RoomModel.where({ id: roomId }).fetch();
    if (room) {
      await new LineModel({
        color,
        hash,
        room: room.id,
        roomName: room.get('name'),
        text,
        user: userId,
      }).save();
    }
  } catch (e) {
    // console.error(`lineAddFailed ${e}`);
    e.stack();
  }
}

export function addLine(text: string, roomId: number, userId: number, color: string) {
  const room = rooms.get(roomId);
  if (room) {
    room.lines = room.lines || List();
    const timeout = new Date();
    timeout.setMinutes(timeout.getMinutes() + 7);
    const hash = Crypto.createHash('sha256').update(`${color}${timeout.toISOString() }${text}${userId}`).digest('hex');
    room.lines = room.lines.push({
      color,
      hash,
      text,
      timeout,
      userId,
    });
    rooms = rooms.set(roomId, room);
    addLineToDatabase(text, roomId, userId, color, hash);
  }
}
