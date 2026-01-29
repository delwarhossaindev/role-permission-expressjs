require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');
const { protect, hasPermission } = require('./middleware/auth');

// Controllers
const userController = require('./controllers/userController');
const roleController = require('./controllers/roleController');
const permissionController = require('./controllers/permissionController');

const app = express();

// Body parser
app.use(express.json());

// Connect to database
connectDB();

// ============================================
// Public Routes (No Auth Required)
// ============================================

app.post('/register', userController.register);
app.post('/login', userController.login);

// ============================================
// Protected Routes (Auth Required)
// ============================================

app.post('/logout', protect, userController.logout);
app.get('/loggeduser', protect, userController.loggedUser);
app.post('/changepassword', protect, userController.changePassword);

// ============================================
// List Routes
// ============================================

app.get('/role_list', protect, userController.roleList);
app.get('/permission_list', protect, userController.permissionList);
app.get('/user_list', protect, hasPermission('read-user'), userController.userList);
app.get('/all_user_list', protect, hasPermission('read-user'), userController.allUserList);

// ============================================
// User CRUD Routes
// ============================================

app.get('/user_show/:id', protect, hasPermission('read-user'), userController.show);
app.get('/user_edit/:id', protect, hasPermission('update-user'), userController.userEdit);
app.put('/user_update/:id', protect, hasPermission('update-user'), userController.userUpdate);
app.delete('/user_delete/:id', protect, hasPermission('delete-user'), userController.userDelete);
app.get('/role_wise_user', protect, userController.roleWiseUser);
app.put('/assign_permission/:id', protect, hasPermission('assign-permission'), userController.assignPermission);

// ============================================
// Roles Resource Routes
// ============================================

app.get('/roles', protect, hasPermission('read-role'), roleController.index);
app.post('/roles', protect, hasPermission('create-role'), roleController.store);
app.get('/roles/:id', protect, hasPermission('read-role'), roleController.show);
app.put('/roles/:id', protect, hasPermission('update-role'), roleController.update);
app.delete('/roles/:id', protect, hasPermission('delete-role'), roleController.destroy);

// ============================================
// Permissions Resource Routes
// ============================================

app.get('/permissions', protect, hasPermission('read-permission'), permissionController.index);
app.post('/permissions', protect, hasPermission('create-permission'), permissionController.store);
app.get('/permissions/:id', protect, hasPermission('read-permission'), permissionController.show);
app.put('/permissions/:id', protect, hasPermission('update-permission'), permissionController.update);
app.delete('/permissions/:id', protect, hasPermission('delete-permission'), permissionController.destroy);

// ============================================
// Utility Route - Get my permissions
// ============================================

app.get('/my-permissions', protect, async (req, res) => {
  const user = req.user;
  let permissions = [];

  // Get role permissions
  if (user.role && user.role.permissions) {
    permissions = user.role.permissions.map(p => p.name);
  }

  // Add direct permissions
  if (user.permissions) {
    const directPerms = user.permissions.map(p => p.name);
    permissions = [...new Set([...permissions, ...directPerms])];
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      role: user.role ? user.role.name : null,
      permissions
    }
  });
});

// ============================================
// 404 Handler
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ============================================
// Error Handler
// ============================================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// Start Server
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('');
  console.log('API Endpoints:');
  console.log('  POST /register          - Register new user');
  console.log('  POST /login             - Login user');
  console.log('  POST /logout            - Logout user');
  console.log('  GET  /loggeduser        - Get logged in user');
  console.log('  POST /changepassword    - Change password');
  console.log('  GET  /user_list         - Get users (paginated)');
  console.log('  GET  /roles             - Get all roles');
  console.log('  GET  /permissions       - Get all permissions');
  console.log('  GET  /my-permissions    - Get current user permissions');
  console.log('');
});
