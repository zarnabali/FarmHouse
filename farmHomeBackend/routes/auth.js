const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const crypto = require('crypto');
require('dotenv').config();
const sendEmail = require('../utils/emailHelper');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};

async function uploadFile(req) {
    let result = await streamUpload(req);
    return result;
}

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               confirm_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User Registered Successfully
 *       400:
 *         description: Bad request
 */
// Register Route
router.post('/signup', async (req, res) => {
    const { name, email, phone, password, confirm_password } = req.body;
    try {
        if (!name || !email || !phone || !password || !confirm_password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        if (password !== confirm_password) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.match(emailRegex)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        let existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Email or phone is already in use' });
        }
        let user = new User({
            name,
            email,
            phone,
            password,
            role: "assistant",
            location: "Islamabad",
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.status(200).json({ msg: 'User Registered Successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "hammad@gmail.com"
 *               password:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
// Login Route
router.post('/login', async (req, res) => {
    const token = req.header('Authorization');
    if (token) {
        return res.status(401).json({ error: 'Already Logged In' });
    }
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(user);
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        if (user.blocked) {
            console.log(user);
            return res.status(400).json({ error: 'Account Blocked' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(isMatch);
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role,
                name: user.fullName,
                email: user.email,
                avatar: user.avatar,
                phone: user.phone
            },
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" }, (err, token) => {
            if (err) throw err;
            res.json({ token, id: user.id, role: user.role, avatar: user.avatar, name: user.name, email: user.email, phone: user.phone });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error: ' + err.message });
    
    }
});

/**
 * @swagger
 * /auth/upload-image:
 *   post:
 *     summary: Upload an image
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded
 *       401:
 *         description: Unauthorized
 */
// Upload Image Route
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
    try {
        const result = await uploadFile(req);
        res.status(200).json({ image_url: result.secure_url });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while uploading the image' });
    }
});

/**
 * @swagger
 * /auth/upload-profilePic:
 *   post:
 *     summary: Upload a profile picture
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded
 *       401:
 *         description: Unauthorized
 */
// Upload Profile Picture Route
router.post('/upload-profilePic', auth, upload.single('avatar'), async (req, res) => {
    try {
        const result = await uploadFile(req);
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.avatar = result.secure_url;
        await user.save();
        res.status(200).json({ avatar: result.secure_url });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while uploading the avatar' });
    }
});

/**
 * @swagger
 * /auth/auth/change-password:
 *   patch:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
// Route to change password
router.patch("/auth/change-password", auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate request body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: "Both current password and new password are required"
            });
        }

        // Password validation
        if (newPassword.length < 6) {
            return res.status(400).json({
                error: "New password must be at least 6 characters long"
            });
        }

        // Get user from database
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Current password is incorrect" });
        }

        // Check if new password is different from current
        if (currentPassword === newPassword) {
            return res.status(400).json({
                error: "New password must be different from current password"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Save updated user
        await user.save();

        res.json({
            message: "Password updated successfully",
            timestamp: new Date(),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({
            error: "Server error",
            details: error.message
        });
    }
});

/**
 * @swagger
 * /auth/forget-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */
// Route to send password reset email
router.post('/forget-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour expiry
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();
        // Construct reset link
        const resetLink = `${process.env.FRONT_END_URL}/auth/reset-password?token=${resetToken}`;
        // Send email (assuming sendEmail utility exists)
        await sendEmail(user.email, 'Password Reset Request', `Click the link to reset your password: ${resetLink}`);
        res.status(200).json({ message: 'Password reset email sent', resetLink: resetLink });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Bad request
 *       404:
 *         description: Invalid or expired token
 */
router.post('/reset-password', async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'Token, newPassword, and confirmPassword are required' });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    try {
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            return res.status(404).json({ error: 'Invalid or expired token' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /auth/check-token:
 *   post:
 *     summary: Check if a JWT token is valid
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Invalid or expired token
 */
// Route to check if JWT token is valid
router.post('/check-token', async (req, res) => {
    // Try to get token from Authorization header or body

    console.log(req.body);

    let token = req.header('Authorization');
    if (!token && req.body.token) {
        token = req.body.token;
    }
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }
    // Remove 'Bearer ' prefix if present
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ valid: true, payload: decoded });
    } catch (err) {
        res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }
});

/**
 * @swagger
 * /auth/user/{userId}:
 *   get:
 *     summary: Get user details by user ID
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       400:
 *         description: Invalid userId format
 *       404:
 *         description: User not found
 */
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    // Validate userId format (MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
        return res.status(400).json({ error: 'Invalid userId format. Must be a MongoDB ObjectId.' });
    }
    try {
        const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires -__v');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /auth/create-manager:
 *   post:
 *     summary: Create a new manager (admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Manager created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/create-manager',auth, admin, async (req, res) => {
  const { name, email, phone, password, location } = req.body;
  try {
    if (!name || !email || !phone || !password || !location) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.match(emailRegex)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    let existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or phone is already in use' });
    }
    let user = new User({
      name,
      email,
      phone,
      password,
      role: 'manager',
      location
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ message: 'Manager created successfully', user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /auth/create-assistant:
 *   post:
 *     summary: Create a new assistant (admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Assistant created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/create-assistant', auth,admin, async (req, res) => {
  const { name, email, phone, password, location } = req.body;
  try {
    if (!name || !email || !phone || !password || !location) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.match(emailRegex)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    let existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or phone is already in use' });
    }
    let user = new User({
      name,
      email,
      phone,
      password,
      role: 'assistant',
      location
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ message: 'Assistant created successfully', user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


 /* /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *   patch:
 *     summary: Update user profile (name, phone)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
// Get current user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user profile (name, phone)
router.patch('/profile', auth, async (req, res) => {
    try {
        const { name, phone } = req.body;
        if (!name && !phone) {
            return res.status(400).json({ error: 'At least one of name or phone is required' });
        }
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (name) user.name = name;
        if (phone) user.phone = phone;
        await user.save();
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;