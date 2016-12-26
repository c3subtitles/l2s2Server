// @flow
/* eslint no-console: 0 */
import RoleModel from 'Model/RoleModel';

RoleModel.fetchAll().then(roles => {
  console.log(roles);
})
.catch(e => {
  console.error(e);
});
