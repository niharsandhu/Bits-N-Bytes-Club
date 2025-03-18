const mongoose = require('mongoose');

const clubHeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  bio: { type: String, required: true },
  image: {
    url: { type: String, required: true },       // Cloudinary URL
    public_id: { type: String, required: true }, // Cloudinary Public ID (for delete)
  }
}, { timestamps: true });

module.exports = mongoose.model('ClubHead', clubHeadSchema);
