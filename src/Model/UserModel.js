// @flow
import BaseModel from './BaseModel';
import RoleModel from './RoleModel';

export default class UserModel extends BaseModel<User> {
  static tableName = 'user';
  static idAttribute = 'id';
  role() {
    return this.belongsTo(RoleModel, 'role');
  }
  async client() {
    return {
      active: this.get('active'),
      canBan: this.get('canBan'),
      id: this.id,
      role: await this.role().fetch(),
      username: this.get('username'),
    };
  }
}
