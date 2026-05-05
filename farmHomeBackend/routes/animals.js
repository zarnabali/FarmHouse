const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const auth = require('../middleware/auth');
const csvHelper = require('../utils/csvHelper');
const admin = require('../middleware/admin');
const manager = require('../middleware/manager');
const assistant = require('../middleware/assistant');
const Breeding = require('../models/Breeding');
const HealthRecord = require('../models/HealthRecord');
const Incident = require('../models/Incident');
const User = require('../models/User');

/**
 * @swagger
 * /animals:
 *   post:
 *     summary: Create a new animal
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagId
 *               - breed
 *               - gender
 *               - dob
 *               - weight
 *               - condition
 *               - status
 *               - farmhouse
 *               - acquisitionType
 *               - acquisitionDate
 *             properties:
 *               tagId:
 *                 type: string
 *                 example: G001
 *               breed:
 *                 type: string
 *                 example: Boer
 *               gender:
 *                 type: string
 *                 enum: [Male, Female]
 *                 example: Male
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: 2022-03-15
 *               weight:
 *                 type: number
 *                 example: 45.5
 *               condition:
 *                 type: string
 *                 example: Excellent
 *               status:
 *                 type: string
 *                 example: Active
 *               farmhouse:
 *                 type: string
 *                 example: Papu Famu
 *               sireId:
 *                 type: string
 *                 example: G050
 *               damId:
 *                 type: string
 *                 example: G051
 *               acquisitionType:
 *                 type: string
 *                 example: Birth
 *               acquisitionDate:
 *                 type: string
 *                 format: date
 *                 example: 2022-03-15
 *               origin:
 *                 type: string
 *                 example: Local Farm
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["animal_photo1.jpg", "animal_photo2.jpg"]
 *               notes:
 *                 type: string
 *                 example: Healthy young goat
 *     responses:
 *       201:
 *         description: Animal created
 *       400:
 *         description: Bad request
 */
router.post('/', auth, async (req, res) => {
  const {
    tagId,
    breed,
    gender,
    dob,
    weight,
    condition,
    status,
    farmhouse,
    sireId,
    damId,
    acquisitionType,
    acquisitionDate,
    origin,
    images,
    notes
  } = req.body;

  // Validate required fields
  if (!tagId || !breed || !gender || !dob || !weight || !condition || !status || !farmhouse || !acquisitionType || !acquisitionDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!['Male', 'Female'].includes(gender)) {
    return res.status(400).json({ error: 'Invalid gender' });
  }
  if (isNaN(weight) || weight <= 0) {
    return res.status(400).json({ error: 'Invalid weight' });
  }
  if (images && (!Array.isArray(images) || !images.every(img => typeof img === 'string'))) {
    return res.status(400).json({ error: 'Images must be an array of strings' });
  }
  try {
    const animal = new Animal({
      tagId,
      breed,
      gender,
      dob,
      weight,
      condition,
      status,
      farmhouse,
      sireId,
      damId,
      acquisitionType,
      acquisitionDate,
      origin,
      images,
      notes
    });
    await animal.save();
    res.status(201).json({ message: 'Animal created successfully', animal });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /animals:
 *   get:
 *     summary: Get paginated list of animals
 *     tags: [Animals]
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
 *         description: List of animals
 */
router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const animals = await Animal.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Animal.countDocuments();
    res.json({
      animals,
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
 * /animals/all:
 *   get:
 *     summary: Get all animals (public)
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all animals (public)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 animals:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Animal'
 */
router.get('/all', auth, async (req, res) => {
  try {
    const animals = await Animal.find();
    res.status(200).json({ animals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /animals/{id}:
 *   patch:
 *     summary: Update an animal
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Animal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - breed
 *               - gender
 *               - dob
 *               - weight
 *               - condition
 *               - status
 *               - farmhouse
 *               - acquisitionType
 *               - acquisitionDate
 *               - origin
 *               - images
 *               - notes
 *             properties:
 *               breed:
 *                 type: string
 *                 example: Boer
 *               gender:
 *                 type: string
 *                 enum: [Male, Female]
 *                 example: Male
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: 2022-03-15
 *               weight:
 *                 type: number
 *                 example: 45.5
 *               condition:
 *                 type: string
 *                 example: Excellent
 *               status:
 *                 type: string
 *                 example: Active
 *               farmhouse:
 *                 type: string
 *                 example: Papu Famu
 *               acquisitionType:
 *                 type: string
 *                 example: Birth
 *               acquisitionDate:
 *                 type: string
 *                 format: date
 *                 example: 2022-03-15
 *               origin:
 *                 type: string
 *                 example: Local Farm
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["animal_photo1.jpg", "animal_photo2.jpg"]
 *               notes:
 *                 type: string
 *                 example: Healthy young goat
 *     responses:
 *       200:
 *         description: Animal updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Animal not found
 */
router.patch('/:id', auth, async (req, res) => {
  const {
    breed,
    gender,
    dob,
    weight,
    condition,
    status,
    farmhouse,
    acquisitionType,
    acquisitionDate,
    origin,
    images,
    notes
  } = req.body;
  if (
    breed === undefined ||
    gender === undefined ||
    dob === undefined ||
    weight === undefined ||
    condition === undefined ||
    status === undefined ||
    farmhouse === undefined ||
    acquisitionType === undefined ||
    acquisitionDate === undefined ||
    origin === undefined ||
    images === undefined ||
    notes === undefined
  ) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!['Male', 'Female'].includes(gender)) {
    return res.status(400).json({ error: 'Invalid gender' });
  }
  if (isNaN(weight) || weight <= 0) {
    return res.status(400).json({ error: 'Invalid weight' });
  }
  if (!Array.isArray(images) || !images.every(img => typeof img === 'string')) {
    return res.status(400).json({ error: 'Images must be an array of strings' });
  }
  try {
    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      {
        breed,
        gender,
        dob,
        weight,
        condition,
        status,
        farmhouse,
        acquisitionType,
        acquisitionDate,
        origin,
        images,
        notes
      },
      { new: true }
    );
    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    res.json({ message: 'Animal updated successfully', animal });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /animals/{id}:
 *   delete:
 *     summary: Delete an animal by ID
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Animal MongoDB _id
 *     responses:
 *       200:
 *         description: Animal deleted successfully
 *       404:
 *         description: Animal not found
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const animal = await Animal.findByIdAndDelete(req.params.id);
    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    res.json({ message: 'Animal deleted successfully', animal });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /animals/import-csv:
 *   post:
 *     summary: Import animals from CSV
 *     tags: [Animals]
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
 *         description: Animals imported successfully
 *       400:
 *         description: Bad request
 */
router.post('/import-csv', auth, csvHelper.upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'CSV file is required' });
  }
  const requiredFields = [
    'tagId', 'breed', 'gender', 'dob', 'weight', 'condition', 'status', 'farmhouse', 'sireId', 'damId', 'acquisitionType', 'acquisitionDate', 'origin', 'images', 'notes'
  ];
  try {
    const { valid, invalid } = await csvHelper.importCSV(req.file.buffer, requiredFields);
    // Convert images from string to array
    const processed = valid.map(row => ({ ...row, images: row.images ? row.images.split(';') : [] }));
    if (processed.length === 0) {
      return res.status(400).json({ error: 'No valid rows found in CSV', invalid });
    }
    const inserted = await Animal.insertMany(processed);
    res.status(200).json({ message: 'Animals imported successfully', insertedCount: inserted.length, invalid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /animals/export-csv:
 *   get:
 *     summary: Export all animals as CSV
 *     tags: [Animals]
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
 *                 tagId,breed,gender,dob,weight,condition,status,farmhouse,sireId,damId,acquisitionType,acquisitionDate,origin,images,notes
 *                 G001,Boer,Male,2022-03-15,45.5,Excellent,Active,Papu Famu,G050,G051,Birth,2022-03-15,Local Farm,"animal_photo1.jpg;animal_photo2.jpg",Healthy young goat
 */
router.get('/export-csv', auth, async (req, res) => {
  const fields = [
    'tagId', 'breed', 'gender', 'dob', 'weight', 'condition', 'status', 'farmhouse', 'sireId', 'damId', 'acquisitionType', 'acquisitionDate', 'origin', 'images', 'notes'
  ];
  try {
    const animals = await Animal.find().lean();
    // Convert images array to string for CSV
    const data = animals.map(a => ({ ...a, images: Array.isArray(a.images) ? a.images.join(';') : '' }));
    const csv = csvHelper.exportCSV(data, fields);
    res.header('Content-Type', 'text/csv');
    res.attachment('animals.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 