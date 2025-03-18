const mongoose = require('mongoose');

const eventGallerySchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventType: { type: String ,required:true},
  images: [{
    url: { type: String, required: true },       // Cloudinary URL
    public_id: { type: String, required: true }, // Cloudinary Public ID (for delete)
  }]
}, { timestamps: true });

module.exports = mongoose.model('EventGallery', eventGallerySchema);
