const ClubHead = require('../models/ClubHead');
const EventGallery = require('../models/EventGallery');
const cloudinary = require('../cloudinary');
const fs = require('fs');

// ✅ Upload Single Club Head Image and Save to DB
const uploadClubHeadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { name, designation, bio } = req.body;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'club-heads',
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    });

    // Remove temp file
    fs.unlinkSync(req.file.path);

    // Save to MongoDB
    const newClubHead = new ClubHead({
      name,
      designation,
      bio,
      image: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });

    await newClubHead.save();

    res.status(200).json({
      message: 'Club Head image uploaded and saved successfully',
      data: newClubHead,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ✅ Upload Multiple Event Gallery Images and Save to DB
const uploadEventImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });

    const { eventName, eventDate, eventType } = req.body;

    // Upload each file to Cloudinary
    const uploadPromises = req.files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: 'event-gallery',
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
      })
    );

    const results = await Promise.all(uploadPromises);

    // Remove temp files
    req.files.forEach((file) => fs.unlinkSync(file.path));

    // Extract URLs and public_ids
    const images = results.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id,
    }));

    // Save to MongoDB
    const newEventGallery = new EventGallery({
      eventName,
      eventDate,
      eventType,
      images, // Array of { url, public_id }
    });

    await newEventGallery.save();

    res.status(200).json({
      message: 'Event images uploaded and saved successfully',
      data: newEventGallery,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { uploadClubHeadImage, uploadEventImages };

