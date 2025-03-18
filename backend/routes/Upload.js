const express = require('express');
const router = express.Router();
const { uploadClubHeadImage, uploadEventImages } = require('../controllers/upload');
const upload = require('../middlewares/multer');


// Single Image Upload for Club Head
router.post('/club-head',upload.single('image'), uploadClubHeadImage);

// Multiple Images Upload for Event Gallery
router.post('/event-gallery', upload.array('images', 5), uploadEventImages);

module.exports = router;
