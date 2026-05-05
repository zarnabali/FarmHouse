const express = require('express');
const router = express.Router();
const Vaccination = require('../models/Vaccination');
const auth = require('../middleware/auth');
const csvHelper = require('../utils/csvHelper');

/**
 * @swagger
 * /vaccinations:
 *   post:
 *     summary: Create a new vaccination record
 *     tags: [Vaccinations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - animalTagId
 *               - vaccineName
 *               - manufacturer
 *               - batchNumber
 *               - vaccinationType
 *               - dosage
 *               - administrationRoute
 *               - administeredBy
 *               - treatmentDate
 *               - expiryDate
 *               - nextDueDate
 *               - cost
 *               - status
 *               - sideEffects
 *               - notes
 *             properties:
 *               animalTagId:
 *                 type: string
 *                 example: G001
 *               vaccineName:
 *                 type: string
 *                 example: CDT Vaccine
 *               manufacturer:
 *                 type: string
 *                 example: Zoetis
 *               batchNumber:
 *                 type: string
 *                 example: ZT2024001
 *               vaccinationType:
 *                 type: string
 *                 example: Core
 *               dosage:
 *                 type: string
 *                 example: 2ml
 *               administrationRoute:
 *                 type: string
 *                 example: Subcutaneous
 *               administeredBy:
 *                 type: string
 *                 example: Dr. Smith
 *               treatmentDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-31
 *               nextDueDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-07-15
 *               cost:
 *                 type: number
 *                 example: 15.0
 *               status:
 *                 type: string
 *                 example: Completed
 *               sideEffects:
 *                 type: string
 *                 example: None observed
 *               notes:
 *                 type: string
 *                 example: Annual vaccination completed
 *     responses:
 *       201:
 *         description: Vaccination record created
 *       400:
 *         description: Bad request
 */
router.post('/', auth, async (req, res) => {
  const {
    animalTagId,
    vaccineName,
    manufacturer,
    batchNumber,
    vaccinationType,
    dosage,
    administrationRoute,
    administeredBy,
    treatmentDate,
    expiryDate,
    nextDueDate,
    cost,
    status,
    sideEffects,
    notes
  } = req.body;
  if (!animalTagId || !vaccineName || !manufacturer || !batchNumber || !vaccinationType || !dosage || !administrationRoute || !administeredBy || !treatmentDate || !expiryDate || !nextDueDate || cost === undefined || !status || !sideEffects || !notes) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (isNaN(cost) || cost < 0) {
    return res.status(400).json({ error: 'Invalid cost' });
  }
  try {
    const vaccination = new Vaccination({
      animalTagId,
      vaccineName,
      manufacturer,
      batchNumber,
      vaccinationType,
      dosage,
      administrationRoute,
      administeredBy,
      treatmentDate,
      expiryDate,
      nextDueDate,
      cost,
      status,
      sideEffects,
      notes
    });
    await vaccination.save();
    res.status(201).json({ message: 'Vaccination record created successfully', vaccination });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /vaccinations:
 *   get:
 *     summary: Get paginated list of vaccination records
 *     tags: [Vaccinations]
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
 *         description: List of vaccination records
 */
router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const vaccinations = await Vaccination.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Vaccination.countDocuments();
    res.json({
      vaccinations,
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
 * /vaccinations/import-csv:
 *   post:
 *     summary: Import vaccinations from CSV
 *     tags: [Vaccinations]
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
 *         description: Vaccinations imported successfully
 *       400:
 *         description: Bad request
 */
router.post('/import-csv', auth, csvHelper.upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'CSV file is required' });
  }
  const requiredFields = [
    'animalTagId', 'vaccineName', 'manufacturer', 'batchNumber', 'vaccinationType', 'dosage', 'administrationRoute', 'administeredBy', 'treatmentDate', 'expiryDate', 'nextDueDate', 'cost', 'status', 'sideEffects', 'notes'
  ];
  try {
    const { valid, invalid } = await csvHelper.importCSV(req.file.buffer, requiredFields);
    if (valid.length === 0) {
      return res.status(400).json({ error: 'No valid rows found in CSV', invalid });
    }
    const inserted = await Vaccination.insertMany(valid);
    res.status(200).json({ message: 'Vaccinations imported successfully', insertedCount: inserted.length, invalid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /vaccinations/export-csv:
 *   get:
 *     summary: Export all vaccinations as CSV
 *     tags: [Vaccinations]
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
 *                 animalTagId,vaccineName,manufacturer,batchNumber,vaccinationType,dosage,administrationRoute,administeredBy,treatmentDate,expiryDate,nextDueDate,cost,status,sideEffects,notes
 *                 G001,CDT Vaccine,Zoetis,ZT2024001,Core,2ml,Subcutaneous,Dr. Smith,2024-01-15,2024-12-31,2024-07-15,15.0,Completed,None observed,Annual vaccination completed
 */
router.get('/export-csv', auth, async (req, res) => {
  const fields = [
    'animalTagId', 'vaccineName', 'manufacturer', 'batchNumber', 'vaccinationType', 'dosage', 'administrationRoute', 'administeredBy', 'treatmentDate', 'expiryDate', 'nextDueDate', 'cost', 'status', 'sideEffects', 'notes'
  ];
  try {
    const vaccinations = await Vaccination.find().lean();
    const csv = csvHelper.exportCSV(vaccinations, fields);
    res.header('Content-Type', 'text/csv');
    res.attachment('vaccinations.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /vaccinations/{id}:
 *   patch:
 *     summary: Update a vaccination record
 *     tags: [Vaccinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vaccination record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - cost
 *               - nextDueDate
 *               - sideEffects
 *               - notes
 *             properties:
 *               status:
 *                 type: string
 *                 example: Completed
 *               cost:
 *                 type: number
 *                 example: 15.0
 *               nextDueDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-07-15
 *               sideEffects:
 *                 type: string
 *                 example: None observed
 *               notes:
 *                 type: string
 *                 example: Annual vaccination completed
 *     responses:
 *       200:
 *         description: Vaccination record updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Vaccination record not found
 */
router.patch('/:id', auth, async (req, res) => {
  const { status, cost, nextDueDate, sideEffects, notes } = req.body;
  if (status === undefined || cost === undefined || nextDueDate === undefined || sideEffects === undefined || notes === undefined) {
    return res.status(400).json({ error: 'status, cost, nextDueDate, sideEffects, and notes are required' });
  }
  if (isNaN(cost) || cost < 0) {
    return res.status(400).json({ error: 'Invalid cost' });
  }
  try {
    const vaccination = await Vaccination.findByIdAndUpdate(
      req.params.id,
      { status, cost, nextDueDate, sideEffects, notes },
      { new: true }
    );
    if (!vaccination) return res.status(404).json({ error: 'Vaccination record not found' });
    res.json({ message: 'Vaccination record updated successfully', vaccination });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /vaccinations/{id}:
 *   delete:
 *     summary: Delete a vaccination by ID
 *     tags: [Vaccinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vaccination MongoDB _id
 *     responses:
 *       200:
 *         description: Vaccination deleted successfully
 *       404:
 *         description: Vaccination not found
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const vaccination = await Vaccination.findByIdAndDelete(req.params.id);
    if (!vaccination) return res.status(404).json({ error: 'Vaccination not found' });
    res.json({ message: 'Vaccination deleted successfully', vaccination });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 