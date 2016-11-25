import 'babel-polyfill';
import bcrypt from 'bcryptjs';
import '../models/modelsInit';


global.encrypt = function(value) {
  return new Promise(resolve => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(value, salt, (err, hash) => {
        resolve(hash);
      });
    });
  });
};
global.initPromise.then(() => {
  const Role = global.models.Role;
  async function createRoles() {
    const roles = await Promise.all([
      Role.findOrCreate({ name: 'Admin' }, {
        name: 'admin',
        canActivateUser: true,
        canChangeUserRole: true,
        canCreateRoom: true,
        canCreateUser: true,
        canDeleteRoom: true,
        canDeleteUser: true,
        canJoinLocked: true,
        canJoinSpeechLocked: true,
        canLock: true,
        canSpeechLock: true,
      }),
      Role.findOrCreate({ name: 'Speech Recognition' }, {
        name: 'Speech Recognition',
        canJoinSpeechLocked: true,
        canSpeechLock: true,
      }),
      Role.findOrCreate({ name: 'Angel Mod' }, {
        name: 'Angel Mod',
        canActivateUser: true,
        canCreateUser: true,
      }),
      Role.findOrCreate({ name: 'User' }, {
        name: 'User',
      }),
    ]);
    return roles;
  }

  async function createAdmin(roles: Array<RoleType>) {
    const adminRole = roles.find(x => x.name === 'admin');
    const User = global.models.User;
    return await User.findOrCreate({ username: 'admin' }, {
      username: 'admin',
      password: 'admin',
      active: true,
      role: adminRole.id,
    });
  }

  createRoles().then(createAdmin).then(() => {
    process.exit(0);
  });
})
.catch(e => {
  console.error(e.stack);
});
