const express = require('express');
const router = express.Router();
const FarmhouseUsers = require('../models/FarmhouseUsers');
const admin = require('../middleware/admin');
const superadmin = require('../middleware/superadmin');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /farmhouse-users:
 *   get:
 *     summary: Get all FarmhouseUsers (superadmin only)
 *     tags: [FarmhouseUsers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all FarmhouseUsers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FarmhouseUsers'
 *       401:
 *         description: Unauthorized
 */
// Get all FarmhouseUsers (superadmin only)
router.get('/', auth, superadmin, async (req, res) => {
  try {
    const all = await FarmhouseUsers.find().populate('adminId managers assistants');
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /farmhouse-users/{adminId}:
 *   get:
 *     summary: Get FarmhouseUsers for a specific adminId (admin only)
 *     tags: [FarmhouseUsers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         schema:
 *           type: string
 *         required: true
 *         description: Admin user ID
 *     responses:
 *       200:
 *         description: FarmhouseUsers for the admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FarmhouseUsers'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
// Get FarmhouseUsers for a specific adminId (admin only)
router.get('/:adminId', auth, admin, async (req, res) => {
  try {
    const doc = await FarmhouseUsers.findOne({ adminId: req.params.adminId }).populate('adminId managers assistants');
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /farmhouse-users/{adminId}/assistant:
 *   post:
 *     summary: Add an assistant to FarmhouseUsers for a specific adminId (admin only)
 *     tags: [FarmhouseUsers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         schema:
 *           type: string
 *         required: true
 *         description: Admin user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assistantId
 *             properties:
 *               assistantId:
 *                 type: string
 *                 description: Assistant user ID
 *     responses:
 *       200:
 *         description: Assistant added or already present
 *       201:
 *         description: FarmhouseUsers created and assistant added
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
// Add an assistant to FarmhouseUsers for a specific adminId (admin only)
router.post('/:adminId/assistant', auth, admin, async (req, res) => {
  const { assistantId } = req.body;
  if (!assistantId) return res.status(400).json({ error: 'assistantId required' });
  try {
    let doc = await FarmhouseUsers.findOne({ adminId: req.params.adminId });
    let message = '';
    if (!doc) {
      doc = new FarmhouseUsers({
        adminId: req.params.adminId,
        assistants: [assistantId],
        managers: []
      });
      await doc.save();
      message = `FarmhouseUsers created for adminId ${req.params.adminId} and assistantId ${assistantId} added.`;
    } else {
      if (!doc.assistants.includes(assistantId)) {
        doc.assistants.push(assistantId);
        await doc.save();
        message = `AssistantId ${assistantId} added to FarmhouseUsers of adminId ${req.params.adminId}.`;
      } else {
        message = `AssistantId ${assistantId} already exists in FarmhouseUsers of adminId ${req.params.adminId}.`;
      }
    }
    await doc.populate('adminId managers assistants');
    res.json({ message, farmhouseUser: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /farmhouse-users/{adminId}/manager:
 *   post:
 *     summary: Add a manager to FarmhouseUsers for a specific adminId (admin only)
 *     tags: [FarmhouseUsers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         schema:
 *           type: string
 *         required: true
 *         description: Admin user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - managerId
 *             properties:
 *               managerId:
 *                 type: string
 *                 description: Manager user ID
 *     responses:
 *       200:
 *         description: Manager added or already present
 *       201:
 *         description: FarmhouseUsers created and manager added
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
// Add a manager to FarmhouseUsers for a specific adminId (admin only)
router.post('/:adminId/manager', auth, admin, async (req, res) => {
  const { managerId } = req.body;
  if (!managerId) return res.status(400).json({ error: 'managerId required' });
  try {
    let doc = await FarmhouseUsers.findOne({ adminId: req.params.adminId });
    let message = '';
    if (!doc) {
      doc = new FarmhouseUsers({
        adminId: req.params.adminId,
        managers: [managerId],
        assistants: []
      });
      await doc.save();
      message = `FarmhouseUsers created for adminId ${req.params.adminId} and managerId ${managerId} added.`;
    } else {
      if (!doc.managers.includes(managerId)) {
        doc.managers.push(managerId);
        await doc.save();
        message = `ManagerId ${managerId} added to FarmhouseUsers of adminId ${req.params.adminId}.`;
      } else {
        message = `ManagerId ${managerId} already exists in FarmhouseUsers of adminId ${req.params.adminId}.`;
      }
    }
    await doc.populate('adminId managers assistants');
    res.json({ message, farmhouseUser: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /farmhouse-users/{adminId}/assistant/{assistantId}:
 *   delete:
 *     summary: Delete an assistant from FarmhouseUsers for a specific adminId (admin only)
 *     tags: [FarmhouseUsers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         schema:
 *           type: string
 *         required: true
 *         description: Admin user ID
 *       - in: path
 *         name: assistantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Assistant user ID
 *     responses:
 *       200:
 *         description: Assistant removed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
// Delete an assistant from FarmhouseUsers for a specific adminId (admin only)
router.delete('/:adminId/assistant/:assistantId', auth, admin, async (req, res) => {
  try {
    let doc = await FarmhouseUsers.findOne({ adminId: req.params.adminId });
    let message = '';
    if (!doc) {
      message = `FarmhouseUsers not found for adminId ${req.params.adminId}.`;
      return res.status(404).json({ message });
    }
    const idx = doc.assistants.indexOf(req.params.assistantId);
    if (idx !== -1) {
      doc.assistants.splice(idx, 1);
      await doc.save();
      await doc.populate('adminId managers assistants');
      message = `AssistantId ${req.params.assistantId} removed from FarmhouseUsers of adminId ${req.params.adminId}.`;
      return res.json({ message, farmhouseUser: doc });
    } else {
      message = `AssistantId ${req.params.assistantId} not found in FarmhouseUsers of adminId ${req.params.adminId}.`;
      return res.status(404).json({ message, farmhouseUser: doc });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /farmhouse-users/{adminId}/manager/{managerId}:
 *   delete:
 *     summary: Delete a manager from FarmhouseUsers for a specific adminId (admin only)
 *     tags: [FarmhouseUsers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         schema:
 *           type: string
 *         required: true
 *         description: Admin user ID
 *       - in: path
 *         name: managerId
 *         schema:
 *           type: string
 *         required: true
 *         description: Manager user ID
 *     responses:
 *       200:
 *         description: Manager removed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
// Delete a manager from FarmhouseUsers for a specific adminId (admin only)
router.delete('/:adminId/manager/:managerId', auth, admin, async (req, res) => {
  try {
    let doc = await FarmhouseUsers.findOne({ adminId: req.params.adminId });
    let message = '';
    if (!doc) {
      message = `FarmhouseUsers not found for adminId ${req.params.adminId}.`;
      return res.status(404).json({ message });
    }
    const idx = doc.managers.indexOf(req.params.managerId);
    if (idx !== -1) {
      doc.managers.splice(idx, 1);
      await doc.save();
      await doc.populate('adminId managers assistants');
      message = `ManagerId ${req.params.managerId} removed from FarmhouseUsers of adminId ${req.params.adminId}.`;
      return res.json({ message, farmhouseUser: doc });
    } else {
      message = `ManagerId ${req.params.managerId} not found in FarmhouseUsers of adminId ${req.params.adminId}.`;
      return res.status(404).json({ message, farmhouseUser: doc });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 