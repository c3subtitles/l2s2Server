// @flow
import BaseModel from './BaseModel';

export default class RoleModel extends BaseModel<Role> {
  static tableName = 'role';
  static idAttribute = 'id';
}
