const ac = require('../roles/roles');

/**
 * Permission middleware factory
 * @param {string} action - Action type: create, read, update, delete
 * @param {string} resource - Resource name: profile, post, user
 * @param {boolean} isOwn - Check own resource (true) or any resource (false)
 */
const checkPermission = (action, resource, isOwn = false) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role || 'user';

      // Build the permission method name
      // e.g., readOwn, readAny, createOwn, createAny, etc.
      const permissionType = isOwn ? 'Own' : 'Any';
      const permissionMethod = `${action}${permissionType}`;

      const permission = ac.can(userRole)[permissionMethod](resource);

      if (permission.granted) {
        // Attach permission to request for filtering attributes
        req.permission = permission;
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to perform this action.'
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions',
        error: error.message
      });
    }
  };
};

/**
 * Check if user can access their own resource or any resource
 * Automatically determines based on resource ownership
 */
const checkOwnership = (action, resource) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role || 'user';
      const userId = req.user?.id;
      const resourceOwnerId = req.params.userId || req.body.userId;

      // Check if user is accessing their own resource
      const isOwner = userId && resourceOwnerId && userId === resourceOwnerId;

      let permission;

      if (isOwner) {
        permission = ac.can(userRole)[`${action}Own`](resource);
      } else {
        permission = ac.can(userRole)[`${action}Any`](resource);
      }

      if (permission.granted) {
        req.permission = permission;
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to perform this action.'
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions',
        error: error.message
      });
    }
  };
};

module.exports = {
  checkPermission,
  checkOwnership
};
