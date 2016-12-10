// @flow
import BaseModel from './BaseModel';
import UserModel from './UserModel';

export default class OneTimeTokenModel extends BaseModel<OneTimeToken> {
  static tableName = 'onetimetoken';
  static idAttribute = 'id';
  user() {
    return this.belongsTo(UserModel, 'user');
  }
}
