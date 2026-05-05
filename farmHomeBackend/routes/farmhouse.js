const express = require('express');
const router = express.Router();
const Farmhouse = require('../models/Farmhouse');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin')

/**
 * @swagger
 * tags:
 *   name: Farmhouse
 *   description: Farmhouse management
 */

/**
 * @swagger
 * /farmhouse:
 *   post:
 *     summary: Create a new farmhouse
 *     tags: [Farmhouse]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *                 example: "Green Valley Farm"
 *               manager_id:
 *                 type: string
 *                 example: "64a1b2c3d4e5f6a7b8c9d0e1"
 *               assistants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64a1b2c3d4e5f6a7b8c9d0e2", "64a1b2c3d4e5f6a7b8c9d0e3"]
 *               location:
 *                 type: string
 *                 example: "Lahore"
 *           description: |
 *             The `admin` field is set automatically from the authenticated user and should not be provided in the request body. The `f_id` is auto-generated and unique.
 *     responses:
 *       201:
 *         description: Farmhouse created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized, missing or invalid JWT
 */

/**
 * @swagger
 * /farmhouse:
 *   get:
 *     summary: Get all farmhouses
 *     tags: [Farmhouse]
 *     responses:
 *       200:
 *         description: List of farmhouses
 */

/**
 * @swagger
 * /farmhouse/{id}:
 *   get:
 *     summary: Get a farmhouse by ID
 *     tags: [Farmhouse]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Farmhouse ID
 *     responses:
 *       200:
 *         description: Farmhouse found
 *       404:
 *         description: Farmhouse not found
 */

/**
 * @swagger
 * /farmhouse/{id}:
 *   put:
 *     summary: Update a farmhouse
 *     tags: [Farmhouse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Farmhouse ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *                 example: "Green Valley Farm"
 *               manager_id:
 *                 type: string
 *                 example: "64a1b2c3d4e5f6a7b8c9d0e1"
 *               assistants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64a1b2c3d4e5f6a7b8c9d0e2", "64a1b2c3d4e5f6a7b8c9d0e3"]
 *               location:
 *                 type: string
 *                 example: "Lahore"
 *           description: |
 *             The `admin` field is set automatically from the authenticated user and should not be provided in the request body. The `f_id` is auto-generated and unique.
 *     responses:
 *       200:
 *         description: Farmhouse updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized, missing or invalid JWT
 *       404:
 *         description: Farmhouse not found
 */

/**
 * @swagger
 * /farmhouse/{id}:
 *   delete:
 *     summary: Delete a farmhouse
 *     tags: [Farmhouse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Farmhouse ID
 *     responses:
 *       200:
 *         description: Farmhouse deleted
 *       401:
 *         description: Unauthorized, missing or invalid JWT
 *       404:
 *         description: Farmhouse not found
 */

// Create a new farmhouse (protected)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { Name, manager_id, assistants, location } = req.body;
    const farmhouse = new Farmhouse({ name: Name, manager: manager_id, admin: req.user.id, assistants, location });
    await farmhouse.save();
    res.status(201).json(farmhouse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all farmhouses (public)
router.get('/', async (req, res) => {
  try {
    const farmhouses = await Farmhouse.find();
    res.json(farmhouses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all farmhouses for the current admin (admin only)
router.get('/admin', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  try {
    const farmhouses = await Farmhouse.find({ admin: req.user.id });
    res.json(farmhouses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all farmhouses for the current manager (manager only)
router.get('/manager', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Access denied. Managers only.' });
  }
  try {
    const farmhouses = await Farmhouse.find({ manager: req.user.id });
    res.json(farmhouses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all farmhouses for the current assistant (assistant only)
router.get('/assistant', auth, async (req, res) => {
  if (req.user.role !== 'assistant') {
    return res.status(403).json({ error: 'Access denied. Assistants only.' });
  }
  try {
    const farmhouses = await Farmhouse.find({ assistants: req.user.id });
    res.json(farmhouses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single farmhouse by ID
router.get('/:id', auth, admin, async (req, res) => {
  try {
    const farmhouse = await Farmhouse.findOne({ _id: req.params.id, admin: req.user.id });
    if (!farmhouse) return res.status(404).json({ error: 'Farmhouse not found' });
    res.json(farmhouse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a farmhouse
router.put('/:id', auth, admin , async (req, res) => {
  try {
    const { Name, manager_id, assistants, location } = req.body;

    // Check if the user is the admin of the farmhouse
    const farmhouseToUpdate = await Farmhouse.findById(req.params.id);

    if (!farmhouseToUpdate) {
      return res.status(404).json({ error: 'Farmhouse not found' });
    }

    if (farmhouseToUpdate.admin.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You are not the admin of this farmhouse.' });
    }

    const updateFields = { name: Name, manager: manager_id, assistants, location };
    const farmhouse = await Farmhouse.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    res.json(farmhouse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a farmhouse (protected)
router.delete('/:id', auth, admin || superadmin, async (req, res) => {
  try {
    const farmhouseToDelete = await Farmhouse.findById(req.params.id);
    if (!farmhouseToDelete) {
      return res.status(404).json({ error: 'Farmhouse not found' });
    }
    if (farmhouseToDelete.admin.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You are not the admin of this farmhouse.' });
    }
    const farmhouse = await Farmhouse.findByIdAndDelete(req.params.id);
    res.json({ message: 'Farmhouse deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 