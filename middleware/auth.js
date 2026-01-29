const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      include: [
        { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] },
        { model: Permission, as: 'permissions' }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.'
    });
  }
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Check if user has specific permission
const hasPermission = (...permissionNames) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Get user's role permissions
      let userPermissions = [];

      if (user.role && user.role.permissions) {
        userPermissions = user.role.permissions.map(p => p.name);
      }

      // Add user's direct permissions
      if (user.permissions) {
        const directPermissions = user.permissions.map(p => p.name);
        userPermissions = [...new Set([...userPermissions, ...directPermissions])];
      }

      // Check if user has admin role (full access)
      if (user.role && user.role.name === 'admin') {
        return next();
      }

      // Check if user has required permission
      const hasRequired = permissionNames.some(perm => userPermissions.includes(perm));

      if (!hasRequired) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to perform this action.'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions',
        error: error.message
      });
    }
  };
};

// Check if user has specific role
const hasRole = (...roleNames) => {
  return (req, res, next) => {
    if (!req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. No role assigned.'
      });
    }

    if (!roleNames.includes(req.user.role.name)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Required role: ' + roleNames.join(' or ')
      });
    }

    next();
  };
};

module.exports = {
  protect,
  generateToken,
  hasPermission,
  hasRole
};
