// @flow
import BaseModel from './BaseModel';

export default class RoomModel extends BaseModel<Room> {
  static tableName = 'room';
  static idAttribute = 'id';
}
