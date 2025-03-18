const express = require('express');
const router = express.Router();
const authController = require('../controllers/Auth');
const adminController = require('../controllers/Admin');
const { authMiddleware } = require('../middlewares/Admin');
const { registerValidator, adminValidator } = require('../middlewares/validators');

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

// Apply to login route
router.post('/login', loginLimiter, authController.login);

// Core Team Registration Route (Only Admins can register Core Team Members)
router.post('/register/core-team', authMiddleware(['admin']), registerValidator, adminController.registerCoreTeam);
router.post('/register/admin', adminValidator, adminController.registerAdmin);
router.get('/getStats', authMiddleware(['admin']), adminController.getStats);
router.get('/clubHeads', adminController.getClubHeads);
router.get('/gallery', adminController.getEventGallery);

module.exports = router;
