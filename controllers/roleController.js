const { Role, Permission } = require('../models');

// @desc    Get all roles
// @route   GET /roles
const index = async (req, res) => {
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

// @desc    Create role
// @route   POST /roles
const store = async (req, res) => {
  try {
    const { name, permissions, description } = req.body;

    const roleExists = await Role.findOne({ where: { name } });
    if (roleExists) {
      return res.status(400).json({
        success: false,
        message: 'Role already exists'
      });
    }

    const role = await Role.create({
      name,
      description
    });

    // Assign permissions if provided
    if (permissions && permissions.length > 0) {
      await role.setPermissions(permissions);
    }

    const populatedRole = await Role.findByPk(role.id, {
      include: [{ model: Permission, as: 'permissions' }]
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: populatedRole
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating role',
      error: error.message
    });
  }
};

// @desc    Get single role
// @route   GET /roles/:id
const show = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [{ model: Permission, as: 'permissions' }]
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching role',
      error: error.message
    });
  }
};

// @desc    Update role
// @route   PUT /roles/:id
const update = async (req, res) => {
  try {
    const { name, permissions, description } = req.body;

    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    await role.update({
      name: name || role.name,
      description: description !== undefined ? description : role.description
    });

    // Update permissions if provided
    if (permissions !== undefined) {
      await role.setPermissions(permissions);
    }

    const updatedRole = await Role.findByPk(req.params.id, {
      include: [{ model: Permission, as: 'permissions' }]
    });

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message
    });
  }
};

// @desc    Delete role
// @route   DELETE /roles/:id
const destroy = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    await role.destroy();

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting role',
      error: error.message
    });
  }
};

module.exports = {
  index,
  store,
  show,
  update,
  destroy
};
