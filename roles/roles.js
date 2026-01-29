const AccessControl = require('accesscontrol');

const ac = new AccessControl();

// Define roles and their permissions
// Roles: admin, moderator, user

// User role - basic permissions
ac.grant('user')
  .readOwn('profile')
  .updateOwn('profile')
  .readAny('post')
  .createOwn('post')
  .updateOwn('post')
  .deleteOwn('post');

// Moderator role - extends user + extra permissions
ac.grant('moderator')
  .extend('user')
  .readAny('profile')
  .updateAny('post')
  .deleteAny('post');

// Admin role - full access
ac.grant('admin')
  .extend('moderator')
  .createAny('profile')
  .updateAny('profile')
  .deleteAny('profile')
  .createAny('post')
  .createAny('user')
  .readAny('user')
  .updateAny('user')
  .deleteAny('user');

module.exports = ac;
