const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');
const superadmin = require('../middleware/superadmin');
const User = require('../models/User');
const Farmhouse = require('../models/Farmhouse');

/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: Alert management
 */

/**
 * @swagger
 * /alerts:
 *   post:
 *     summary: Create a new alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - location
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Alert created
 *       400:
 *         description: Bad request
 *       403:
 *         description: Access denied. Super admin only.
 */

/**
 * @swagger
 * /alerts/{id}:
 *   put:
 *     summary: Update an alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Alert ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alert updated
 *       400:
 *         description: Bad request
 *       403:
 *         description: Access denied. Super admin only.
 *       404:
 *         description: Alert not found
 */

/**
 * @swagger
 * /alerts/{id}:
 *   patch:
 *     summary: Partially update an alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Alert ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alert updated
 *       400:
 *         description: Bad request
 *       403:
 *         description: Access denied. Super admin only.
 *       404:
 *         description: Alert not found
 */

/**
 * @swagger
 * /alerts/{id}:
 *   delete:
 *     summary: Delete an alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert deleted
 *       403:
 *         description: Access denied. Super admin only.
 *       404:
 *         description: Alert not found
 */

/**
 * @swagger
 * /alerts:
 *   get:
 *     summary: Get alerts for user's farmhouse location
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of alerts for user's farmhouse location
 *       400:
 *         description: User farmhouse location not set
 */

/**
 * @swagger
 * /alerts/all-public:
 *   get:
 *     summary: Get all alerts (public)
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: List of all alerts
 */
router.get('/all-public', async (req, res) => {
  try {
    const alerts = await Alert.find();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /alerts/by-admin/{userId}:
 *   get:
 *     summary: Get alerts for an admin by user ID (matching farmhouse location, public)
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: Admin user ID
 *     responses:
 *       200:
 *         description: List of alerts for the admin's farmhouses
 *       404:
 *         description: No farmhouses or alerts found
 */
router.get('/by-admin/:userId', async (req, res) => {
  try {
    // Get all farmhouses for this admin
    const farmhouses = await Farmhouse.find({ admin: req.params.userId });
    if (!farmhouses.length) return res.status(404).json({ error: 'No farmhouses found for this admin' });
    // Get all alerts
    const alerts = await Alert.find();
    // Filter alerts where alert.location matches any farmhouse location
    const farmhouseLocations = farmhouses.map(fh => fh.location).filter(Boolean);
    const filteredAlerts = alerts.filter(alert => farmhouseLocations.includes(alert.location));
    res.json(filteredAlerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /alerts/by-manager/{userId}:
 *   get:
 *     summary: Get alerts for a manager by user ID (matching farmhouse location, public)
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: Manager user ID
 *     responses:
 *       200:
 *         description: List of alerts for the manager's farmhouses
 *       404:
 *         description: No farmhouses or alerts found
 */
router.get('/by-manager/:userId', async (req, res) => {
  try {
    // Get all farmhouses for this manager
    const farmhouses = await Farmhouse.find({ manager: req.params.userId });
    if (!farmhouses.length) return res.status(404).json({ error: 'No farmhouses found for this manager' });
    // Get all alerts
    const alerts = await Alert.find();
    // Filter alerts where alert.location matches any farmhouse location
    const farmhouseLocations = farmhouses.map(fh => fh.location).filter(Boolean);
    const filteredAlerts = alerts.filter(alert => farmhouseLocations.includes(alert.location));
    res.json(filteredAlerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /alerts/by-assistant/{userId}:
 *   get:
 *     summary: Get alerts for an assistant by user ID (matching farmhouse location, public)
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: Assistant user ID
 *     responses:
 *       200:
 *         description: List of alerts for the assistant's farmhouses
 *       404:
 *         description: No farmhouses or alerts found
 */
router.get('/by-assistant/:userId', async (req, res) => {
  try {
    // Get all farmhouses for this assistant
    const farmhouses = await Farmhouse.find({ assistants: req.params.userId });
    if (!farmhouses.length) return res.status(404).json({ error: 'No farmhouses found for this assistant' });
    // Get all alerts
    const alerts = await Alert.find();
    // Filter alerts where alert.location matches any farmhouse location
    const farmhouseLocations = farmhouses.map(fh => fh.location).filter(Boolean);
    const filteredAlerts = alerts.filter(alert => farmhouseLocations.includes(alert.location));
    res.json(filteredAlerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Create alert (super_admin only)
router.post('/', auth, superadmin, async (req, res) => {
  try {
    const { title, category, location, description } = req.body;
    const alert = new Alert({ title, category, location, description });
    await alert.save();
    // Emit socket event if io is attached
    if (req.app.get('io')) {
      req.app.get('io').emit('new_alert', alert);
    }
    res.status(201).json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT: Update alert (super_admin only)
router.put('/:id', auth, superadmin, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH: Update alert (super_admin only)
router.patch('/:id', auth, superadmin, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Delete alert (super_admin only)
router.delete('/:id', auth, superadmin, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Get alerts for user's farmhouse location
router.get('/', auth, async (req, res) => {
  try {
    // Assume req.user.farmhouse or req.user.location holds user's farmhouse location
    const location = req.user.farmhouse || req.user.location;
    if (!location) {
      return res.status(400).json({ error: 'User farmhouse location not set' });
    }
    const alerts = await Alert.find({ location });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all alerts (superadmin only)
 * @route GET /alerts/all
 * @access Protected (auth, superadmin)
 */
router.get('/all', auth, superadmin, async (req, res) => {
  try {
    const alerts = await Alert.find();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 