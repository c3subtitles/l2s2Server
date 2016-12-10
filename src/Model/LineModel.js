// @flow
import BaseModel from './BaseModel';

export default class LineModel extends BaseModel<Line> {
  static tableName = 'line';
  static idAttribute = 'id';
}
