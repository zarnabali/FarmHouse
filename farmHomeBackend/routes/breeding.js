const express = require('express');
const router = express.Router();
const Breeding = require('../models/Breeding');
const auth = require('../middleware/auth');
const csvHelper = require('../utils/csvHelper');

/**
 * @swagger
 * /breeding:
 *   post:
 *     summary: Create a new breeding record
 *     tags: [Breeding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sireTagId
 *               - damTagId
 *               - breedingDate
 *               - breedingMethod
 *               - expectedDelivery
 *               - actualDelivery
 *               - numberOfOffspring
 *               - status
 *               - cost
 *               - performedBy
 *               - notes
 *             properties:
 *               sireTagId:
 *                 type: string
 *                 example: G001
 *               damTagId:
 *                 type: string
 *                 example: G002
 *               breedingDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               breedingMethod:
 *                 type: string
 *                 example: Natural Mating
 *               expectedDelivery:
 *                 type: string
 *                 format: date
 *                 example: 2024-06-15
 *               actualDelivery:
 *                 type: string
 *                 format: date
 *                 example: 2024-06-18
 *               numberOfOffspring:
 *                 type: integer
 *                 example: 2
 *               status:
 *                 type: string
 *                 example: Successful
 *               cost:
 *                 type: number
 *                 example: 0.0
 *               performedBy:
 *                 type: string
 *                 example: Farm Manager
 *               notes:
 *                 type: string
 *                 example: Healthy twins born
 *     responses:
 *       201:
 *         description: Breeding record created
 *       400:
 *         description: Bad request
 */
router.post('/', auth, async (req, res) => {
  const {
    sireTagId,
    damTagId,
    breedingDate,
    breedingMethod,
    expectedDelivery,
    actualDelivery,
    numberOfOffspring,
    status,
    cost,
    performedBy,
    notes
  } = req.body;
  if (!sireTagId || !damTagId || !breedingDate || !breedingMethod || !expectedDelivery || !actualDelivery || numberOfOffspring === undefined || !status || cost === undefined || !performedBy || !notes) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (isNaN(numberOfOffspring) || numberOfOffspring < 0) {
    return res.status(400).json({ error: 'Invalid numberOfOffspring' });
  }
  if (isNaN(cost) || cost < 0) {
    return res.status(400).json({ error: 'Invalid cost' });
  }
  try {
    const breeding = new Breeding({
      sireTagId,
      damTagId,
      breedingDate,
      breedingMethod,
      expectedDelivery,
      actualDelivery,
      numberOfOffspring,
      status,
      cost,
      performedBy,
      notes
    });
    await breeding.save();
    res.status(201).json({ message: 'Breeding record created successfully', breeding });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /breeding:
 *   get:
 *     summary: Get paginated list of breeding records
 *     tags: [Breeding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of breeding records
 */
router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const breeding = await Breeding.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Breeding.countDocuments();
    res.json({
      breeding,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /breeding/import-csv:
 *   post:
 *     summary: Import breeding records from CSV
 *     tags: [Breeding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Breeding records imported successfully
 *       400:
 *         description: Bad request
 */
router.post('/import-csv', auth, csvHelper.upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'CSV file is required' });
  }
  const requiredFields = [
    'sireTagId', 'damTagId', 'breedingDate', 'breedingMethod', 'expectedDelivery', 'actualDelivery', 'numberOfOffspring', 'status', 'cost', 'performedBy', 'notes'
  ];
  try {
    const { valid, invalid } = await csvHelper.importCSV(req.file.buffer, requiredFields);
    if (valid.length === 0) {
      return res.status(400).json({ error: 'No valid rows found in CSV', invalid });
    }
    const inserted = await Breeding.insertMany(valid);
    res.status(200).json({ message: 'Breeding records imported successfully', insertedCount: inserted.length, invalid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /breeding/export-csv:
 *   get:
 *     summary: Export all breeding records as CSV
 *     tags: [Breeding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *               example: |
 *                 sireTagId,damTagId,breedingDate,breedingMethod,expectedDelivery,actualDelivery,numberOfOffspring,status,cost,performedBy,notes
 *                 G001,G002,2024-01-15,Natural Mating,2024-06-15,2024-06-18,2,Successful,0.0,Farm Manager,Healthy twins born
 */
router.get('/export-csv', auth, async (req, res) => {
  const fields = [
    'sireTagId', 'damTagId', 'breedingDate', 'breedingMethod', 'expectedDelivery', 'actualDelivery', 'numberOfOffspring', 'status', 'cost', 'performedBy', 'notes'
  ];
  try {
    const breeding = await Breeding.find().lean();
    const csv = csvHelper.exportCSV(breeding, fields);
    res.header('Content-Type', 'text/csv');
    res.attachment('breeding.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /breeding/{id}:
 *   patch:
 *     summary: Update a breeding record
 *     tags: [Breeding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Breeding record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - cost
 *               - actualDelivery
 *               - numberOfOffspring
 *               - notes
 *             properties:
 *               status:
 *                 type: string
 *                 example: Successful
 *               cost:
 *                 type: number
 *                 example: 0.0
 *               actualDelivery:
 *                 type: string
 *                 format: date
 *                 example: 2024-06-18
 *               numberOfOffspring:
 *                 type: integer
 *                 example: 2
 *               notes:
 *                 type: string
 *                 example: Healthy twins born
 *     responses:
 *       200:
 *         description: Breeding record updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Breeding record not found
 */
router.patch('/:id', auth, async (req, res) => {
  const { status, cost, actualDelivery, numberOfOffspring, notes } = req.body;
  if (status === undefined || cost === undefined || actualDelivery === undefined || numberOfOffspring === undefined || notes === undefined) {
    return res.status(400).json({ error: 'status, cost, actualDelivery, numberOfOffspring, and notes are required' });
  }
  if (isNaN(cost) || cost < 0) {
    return res.status(400).json({ error: 'Invalid cost' });
  }
  if (isNaN(numberOfOffspring) || numberOfOffspring < 0) {
    return res.status(400).json({ error: 'Invalid numberOfOffspring' });
  }
  try {
    const breeding = await Breeding.findByIdAndUpdate(
      req.params.id,
      { status, cost, actualDelivery, numberOfOffspring, notes },
      { new: true }
    );
    if (!breeding) return res.status(404).json({ error: 'Breeding record not found' });
    res.json({ message: 'Breeding record updated successfully', breeding });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /breeding/{id}:
 *   delete:
 *     summary: Delete a breeding record by ID
 *     tags: [Breeding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Breeding MongoDB _id
 *     responses:
 *       200:
 *         description: Breeding record deleted successfully
 *       404:
 *         description: Breeding record not found
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const breeding = await Breeding.findByIdAndDelete(req.params.id);
    if (!breeding) return res.status(404).json({ error: 'Breeding record not found' });
    res.json({ message: 'Breeding record deleted successfully', breeding });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 