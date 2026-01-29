const { Permission } = require('../models');

// @desc    Get all permissions
// @route   GET /permissions
const index = async (req, res) => {
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

// @desc    Create permission
// @route   POST /permissions
const store = async (req, res) => {
  try {
    const { name, description } = req.body;

    const permissionExists = await Permission.findOne({ where: { name } });
    if (permissionExists) {
      return res.status(400).json({
        success: false,
        message: 'Permission already exists'
      });
    }

    const permission = await Permission.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating permission',
      error: error.message
    });
  }
};

// @desc    Get single permission
// @route   GET /permissions/:id
const show = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    res.json({
      success: true,
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching permission',
      error: error.message
    });
  }
};

// @desc    Update permission
// @route   PUT /permissions/:id
const update = async (req, res) => {
  try {
    const { name, description } = req.body;

    const permission = await Permission.findByPk(req.params.id);
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    await permission.update({
      name: name || permission.name,
      description: description !== undefined ? description : permission.description
    });

    res.json({
      success: true,
      message: 'Permission updated successfully',
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating permission',
      error: error.message
    });
  }
};

// @desc    Delete permission
// @route   DELETE /permissions/:id
const destroy = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    await permission.destroy();

    res.json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting permission',
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
