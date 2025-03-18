const express = require('express');
const router = express.Router();
const userController = require('../controllers/User');
const { authMiddleware } = require('../middlewares/Admin');
const upload = require('../middlewares/multer');
const { registerValidator } = require('../middlewares/validators');

// User Registration Route
router.post('/register', registerValidator, userController.registerUser);
router.put("/update/:userId", upload.single('image'), userController.updateUser);
router.get('/me', authMiddleware(["user"]), userController.getMyDetails);

module.exports = router;
