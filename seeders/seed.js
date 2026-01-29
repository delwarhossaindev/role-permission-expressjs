const dotenv = require('dotenv');
dotenv.config();

const { sequelize, User, Role, Permission } = require('../models');

const seedDatabase = async () => {
  try {
    // Sync database (create tables)
    await sequelize.sync({ force: true });
    console.log('SQLite Database synced');

    // Create Permissions
    const permissionsData = [
      { name: 'create-user', description: 'Create new user' },
      { name: 'read-user', description: 'View user details' },
      { name: 'update-user', description: 'Update user information' },
      { name: 'delete-user', description: 'Delete user' },
      { name: 'create-role', description: 'Create new role' },
      { name: 'read-role', description: 'View role details' },
      { name: 'update-role', description: 'Update role' },
      { name: 'delete-role', description: 'Delete role' },
      { name: 'create-permission', description: 'Create new permission' },
      { name: 'read-permission', description: 'View permission details' },
      { name: 'update-permission', description: 'Update permission' },
      { name: 'delete-permission', description: 'Delete permission' },
      { name: 'assign-permission', description: 'Assign permissions to users' },
      { name: 'assign-role', description: 'Assign roles to users' }
    ];

    const permissions = await Permission.bulkCreate(permissionsData);
    console.log('Permissions created');

    // Create Roles
    const adminRole = await Role.create({
      name: 'admin',
      description: 'Administrator with full access'
    });
    // Assign all permissions to admin
    await adminRole.setPermissions(permissions);

    const moderatorRole = await Role.create({
      name: 'moderator',
      description: 'Moderator with limited access'
    });
    // Assign specific permissions to moderator
    const moderatorPerms = permissions.filter(p =>
      ['read-user', 'update-user', 'read-role', 'read-permission'].includes(p.name)
    );
    await moderatorRole.setPermissions(moderatorPerms);

    const userRole = await Role.create({
      name: 'user',
      description: 'Regular user with basic access'
    });
    console.log('Roles created');

    // Create Users
    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      roleId: adminRole.id,
      isActive: true
    });

    await User.create({
      name: 'Moderator',
      email: 'moderator@example.com',
      password: 'mod123',
      roleId: moderatorRole.id,
      isActive: true
    });

    await User.create({
      name: 'User',
      email: 'user@example.com',
      password: 'user123',
      roleId: userRole.id,
      isActive: true
    });
    console.log('Users created');

    console.log('');
    console.log('========================================');
    console.log('Database seeded successfully!');
    console.log('========================================');
    console.log('');
    console.log('Test Accounts:');
    console.log('  Admin:     admin@example.com / admin123');
    console.log('  Moderator: moderator@example.com / mod123');
    console.log('  User:      user@example.com / user123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
