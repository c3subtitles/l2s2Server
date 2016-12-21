// @flow
import BaseModel from './BaseModel';
import RoleModel from './RoleModel';

export default class UserModel extends BaseModel<User> {
  static tableName = 'user';
  static idAttribute = 'id';
  role(): RoleModel {
    // $FlowFixMe
    return this.belongsTo(RoleModel, 'role').fetch();
  }
  async client() {
    return {
      active: this.get('active'),
      canBan: this.get('canBan'),
      id: this.id,
      role: await this.role(),
      username: this.get('username'),
    };
  }
}
