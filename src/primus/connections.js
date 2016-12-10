// @flow
import { getUserForSessionId } from '../Services/users';
import { addLine, lineStart, leaveRoom, leaveAllRooms } from '../Services/rooms';

export function emitToRoomAuth(spark: Primus$Spark, roomId: string, ...params: any) {
  // $FlowFixMe
  spark.room(roomId).transform(function(packet, done) {
    if (this.user && this.id !== spark.id) {
      this.emit(...packet.data[0]);
    }
    done(undefined, false);
  })
  .write(params);
}

export function onConnection(spark: Primus$Spark) {
  spark.on('end', () => {
    if (spark.user) {
      // $FlowFixMe
      leaveAllRooms(spark.user.id, (roomId) => {
        // $FlowFixMe
        emitToRoomAuth(spark, roomId, 'leave', roomId, spark.user.client());
      });
    }
  });

  spark.on('sessionId', async sessionId => {
    // $FlowFixMe
    spark.user = await getUserForSessionId(sessionId);
  });

  spark.on('join', roomId => {
    spark.join(roomId);
    if (spark.user) {
      // $FlowFixMe
      emitToRoomAuth(spark, roomId, 'join', roomId, spark.user.client());
    }
  });

  spark.on('leave', roomId => {
    spark.leave(roomId);
    if (spark.user) {
      // $FlowFixMe
      leaveRoom(Number.parseInt(roomId, 10), spark.user.id);
      // $FlowFixMe
      emitToRoomAuth(spark, roomId, 'leave', roomId, spark.user.client());
    }
  });

  spark.on('lineStart', (roomId, text) => {
    if (spark.user) {
      // $FlowFixMe
      lineStart(text, spark.user.id, Number.parseInt(roomId, 10));
      // $FlowFixMe
      emitToRoomAuth(spark, roomId, 'lineStart', roomId, spark.user.id, text);
    }
  });


  spark.on('line', (roomId, text, color) => {
    if (spark.user) {
      // $FlowFixMe
      lineStart('', spark.user.id, Number.parseInt(roomId, 10));
      const timeout = new Date();
      timeout.setMinutes(timeout.getMinutes() + 5);
      // $FlowFixMe
      addLine(text, Number.parseInt(roomId, 10), spark.user.id, color, timeout);
      // $FlowFixMe
      spark.room(roomId).transform(function(packet, done) {
        if (this.id !== spark.id) {
          this.emit(...packet.data[0]);
          done(undefined, false);
        }
        // $FlowFixMe
      }).write(['line', roomId, text, spark.user.id, color, timeout]);
    }
  });
}
