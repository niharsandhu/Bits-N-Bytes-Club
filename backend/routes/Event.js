const express = require('express');
const router = express.Router();
const eventController = require('../controllers/Event');
const userController = require('../controllers/User');
const { authMiddleware } = require('../middlewares/Admin');
const upload = require('../middlewares/multer');
const { eventValidator } = require('../middlewares/validators');

router.post('/create', authMiddleware(['core-team', 'admin']), upload.single('image'), eventValidator, eventController.createEvent);
router.post('/add-round', authMiddleware(['core-team', 'admin']), eventController.addRound);
router.get('/getAllEvents', eventController.getAllEvents);
router.post('/register', authMiddleware(['user']), userController.registerForEvent);
router.post('/qualify', authMiddleware(['core-team', 'admin']), eventController.manualSelection);
router.post('/selected', authMiddleware(['core-team', 'admin']), eventController.qualifyUsersForFirstRound);
router.post('/manualQualify', authMiddleware(['core-team', 'admin']), eventController.manualSelection);
router.post('/updateStatus', authMiddleware(['core-team', 'admin']), eventController.updateEventStatus);
router.get('/recentRegistrations', authMiddleware(['core-team', 'admin']), eventController.getRecentRegistrations);
router.get('/getEvent/:eventId', eventController.getEventById);
router.post('/scanQR', authMiddleware(['admin']), eventController.scanQRCode);

module.exports = router;
