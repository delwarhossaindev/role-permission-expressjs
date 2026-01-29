const { User, Role, Permission } = require('../models');
const { generateToken } = require('../middleware/auth');

// @desc    Register user
// @route   POST /register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Get default user role
    let defaultRole = await Role.findOne({ where: { name: 'user' } });

    const user = await User.create({
      name,
      email,
      password,
      roleId: defaultRole ? defaultRole.id : null
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: defaultRole ? defaultRole.name : null
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({
      where: { email },
      include: [
        { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] },
        { model: Permission, as: 'permissions' }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account is deactivated'
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role ? user.role.name : null
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /logout
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get logged in user
// @route   GET /loggeduser
const loggedUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] },
        { model: Permission, as: 'permissions' }
      ],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   POST /changepassword
const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    const user = await User.findByPk(req.user.id);

    const isMatch = await user.comparePassword(old_password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    user.password = new_password;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// @desc    Get role list
// @route   GET /role_list
const roleList = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{ model: Permission, as: 'permissions' }]
    });
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching roles',
      error: error.message
    });
  }
};

// @desc    Get permission list
// @route   GET /permission_list
const permissionList = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions',
      error: error.message
    });
  }
};

// @desc    Get user list (paginated)
// @route   GET /user_list
const userList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      include: [
        { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] },
        { model: Permission, as: 'permissions' }
      ],
      attributes: { exclude: ['password'] },
      offset,
      limit
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get all user list (no pagination)
// @route   GET /all_user_list
const allUserList = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] },
        { model: Permission, as: 'permissions' }
      ],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Show single user
// @route   GET /user_show/:id
const show = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] },
        { model: Permission, as: 'permissions' }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Get user for edit
// @route   GET /user_edit/:id
const userEdit = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] },
        { model: Permission, as: 'permissions' }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const roles = await Role.findAll();
    const permissions = await Permission.findAll();

    res.json({
      success: true,
      data: {
        user,
        roles,
        permissions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /user_update/:id
const userUpdate = async (req, res) => {
  try {
    const { name, email, roleId, isActive } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      roleId: roleId !== undefined ? roleId : user.roleId,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    const updatedUser = await User.findByPk(req.params.id, {
      include: [
        { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] },
        { model: Permission, as: 'permissions' }
      ],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /user_delete/:id
const userDelete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Get users by role
// @route   GET /role_wise_user
const roleWiseUser = async (req, res) => {
  try {
    const { role } = req.query;

    let whereClause = {};
    if (role) {
      const roleDoc = await Role.findOne({ where: { name: role } });
      if (roleDoc) {
        whereClause.roleId = roleDoc.id;
      }
    }

    const users = await User.findAll({
      where: whereClause,
      include: [
        { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] },
        { model: Permission, as: 'permissions' }
      ],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Assign permissions to user
// @route   PUT /assign_permission/:id
const assignPermission = async (req, res) => {
  try {
    const { permissions } = req.body; // Array of permission IDs

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Set permissions (this will replace existing ones)
    await user.setPermissions(permissions);

    const updatedUser = await User.findByPk(req.params.id, {
      include: [
        { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] },
        { model: Permission, as: 'permissions' }
      ],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'Permissions assigned successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning permissions',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  loggedUser,
  changePassword,
  roleList,
  permissionList,
  userList,
  allUserList,
  show,
  userEdit,
  userUpdate,
  userDelete,
  roleWiseUser,
  assignPermission
};
