const express = require('express');
const router = express.Router();
const HealthRecord = require('../models/HealthRecord');
const auth = require('../middleware/auth');
const csvHelper = require('../utils/csvHelper');

/**
 * @swagger
 * /health-records:
 *   post:
 *     summary: Create a new health record
 *     tags: [HealthRecords]
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
 *               - healthIssue
 *               - symptoms
 *               - diagnosis
 *               - treatment
 *               - veterinarian
 *               - treatmentDate
 *               - followUpDate
 *               - severity
 *               - cost
 *               - status
 *               - notes
 *             properties:
 *               animalTagId:
 *                 type: string
 *                 example: G001
 *               healthIssue:
 *                 type: string
 *                 example: Respiratory Infection
 *               symptoms:
 *                 type: string
 *                 example: Coughing, difficulty breathing
 *               diagnosis:
 *                 type: string
 *                 example: Upper respiratory tract infection
 *               treatment:
 *                 type: string
 *                 example: Antibiotics - Oxytetracycline
 *               veterinarian:
 *                 type: string
 *                 example: Dr. Smith
 *               treatmentDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               followUpDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-22
 *               severity:
 *                 type: string
 *                 example: Moderate
 *               cost:
 *                 type: number
 *                 example: 45.0
 *               status:
 *                 type: string
 *                 example: Resolved
 *               notes:
 *                 type: string
 *                 example: Full recovery after 7 days
 *     responses:
 *       201:
 *         description: Health record created
 *       400:
 *         description: Bad request
 */
router.post('/', auth, async (req, res) => {
  const {
    animalTagId,
    healthIssue,
    symptoms,
    diagnosis,
    treatment,
    veterinarian,
    treatmentDate,
    followUpDate,
    severity,
    cost,
    status,
    notes
  } = req.body;

  if (!animalTagId || !healthIssue || !symptoms || !diagnosis || !treatment || !veterinarian || !treatmentDate || !followUpDate || !severity || cost === undefined || !status || !notes) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (isNaN(cost) || cost < 0) {
    return res.status(400).json({ error: 'Invalid cost' });
  }
  try {
    const record = new HealthRecord({
      animalTagId,
      healthIssue,
      symptoms,
      diagnosis,
      treatment,
      veterinarian,
      treatmentDate,
      followUpDate,
      severity,
      cost,
      status,
      notes
    });
    await record.save();
    res.status(201).json({ message: 'Health record created successfully', healthRecord: record });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /health-records:
 *   get:
 *     summary: Get paginated list of health records
 *     tags: [HealthRecords]
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
 *         description: List of health records
 */
router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const records = await HealthRecord.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await HealthRecord.countDocuments();
    res.json({
      healthRecords: records,
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
 * /health-records/import-csv:
 *   post:
 *     summary: Import health records from CSV
 *     tags: [HealthRecords]
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
 *         description: Health records imported successfully
 *       400:
 *         description: Bad request
 */
router.post('/import-csv', auth, csvHelper.upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'CSV file is required' });
  }
  const requiredFields = [
    'animalTagId', 'healthIssue', 'symptoms', 'diagnosis', 'treatment', 'veterinarian', 'treatmentDate', 'followUpDate', 'severity', 'cost', 'status', 'notes'
  ];
  try {
    const { valid, invalid } = await csvHelper.importCSV(req.file.buffer, requiredFields);
    if (valid.length === 0) {
      return res.status(400).json({ error: 'No valid rows found in CSV', invalid });
    }
    const inserted = await HealthRecord.insertMany(valid);
    res.status(200).json({ message: 'Health records imported successfully', insertedCount: inserted.length, invalid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /health-records/export-csv:
 *   get:
 *     summary: Export all health records as CSV
 *     tags: [HealthRecords]
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
 *                 animalTagId,healthIssue,symptoms,diagnosis,treatment,veterinarian,treatmentDate,followUpDate,severity,cost,status,notes
 *                 G001,Respiratory Infection,"Coughing, difficulty breathing",Upper respiratory tract infection,Antibiotics - Oxytetracycline,Dr. Smith,2024-01-15,2024-01-22,Moderate,45.0,Resolved,Full recovery after 7 days
 */
router.get('/export-csv', auth, async (req, res) => {
  const fields = [
    'animalTagId', 'healthIssue', 'symptoms', 'diagnosis', 'treatment', 'veterinarian', 'treatmentDate', 'followUpDate', 'severity', 'cost', 'status', 'notes'
  ];
  try {
    const records = await HealthRecord.find().lean();
    const csv = csvHelper.exportCSV(records, fields);
    res.header('Content-Type', 'text/csv');
    res.attachment('healthRecords.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /health-records/{id}:
 *   patch:
 *     summary: Update a health record
 *     tags: [HealthRecords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Health record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - severity
 *               - cost
 *               - followUpDate
 *               - notes
 *             properties:
 *               status:
 *                 type: string
 *                 example: Resolved
 *               severity:
 *                 type: string
 *                 example: Moderate
 *               cost:
 *                 type: number
 *                 example: 45.0
 *               followUpDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-25
 *               notes:
 *                 type: string
 *                 example: Patient fully recovered
 *     responses:
 *       200:
 *         description: Health record updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Health record not found
 */
router.patch('/:id', auth, async (req, res) => {
  const { status, severity, cost, followUpDate, notes } = req.body;
  if (status === undefined || severity === undefined || cost === undefined || followUpDate === undefined || notes === undefined) {
    return res.status(400).json({ error: 'status, severity, cost, followUpDate, and notes are required' });
  }
  if (isNaN(cost) || cost < 0) {
    return res.status(400).json({ error: 'Invalid cost' });
  }
  try {
    const record = await HealthRecord.findByIdAndUpdate(
      req.params.id,
      { status, severity, cost, followUpDate, notes },
      { new: true }
    );
    if (!record) return res.status(404).json({ error: 'Health record not found' });
    res.json({ message: 'Health record updated successfully', healthRecord: record });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /health-records/{id}:
 *   delete:
 *     summary: Delete a health record by ID
 *     tags: [HealthRecords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: HealthRecord MongoDB _id
 *     responses:
 *       200:
 *         description: Health record deleted successfully
 *       404:
 *         description: Health record not found
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await HealthRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ error: 'Health record not found' });
    res.json({ message: 'Health record deleted successfully', healthRecord: record });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 