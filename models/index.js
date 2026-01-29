const { sequelize } = require('../config/db');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');

// Role has many Permissions (Many-to-Many)
Role.belongsToMany(Permission, {
  through: 'RolePermissions',
  as: 'permissions',
  foreignKey: 'roleId'
});

Permission.belongsToMany(Role, {
  through: 'RolePermissions',
  as: 'roles',
  foreignKey: 'permissionId'
});

// User belongs to Role
User.belongsTo(Role, {
  as: 'role',
  foreignKey: 'roleId'
});

Role.hasMany(User, {
  as: 'users',
  foreignKey: 'roleId'
});

// User has many Permissions directly (Many-to-Many)
User.belongsToMany(Permission, {
  through: 'UserPermissions',
  as: 'permissions',
  foreignKey: 'userId'
});

Permission.belongsToMany(User, {
  through: 'UserPermissions',
  as: 'users',
  foreignKey: 'permissionId'
});

module.exports = {
  sequelize,
  User,
  Role,
  Permission
};
