const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, trim: true, lowercase: true },
  phone:      { type: String, required: true, trim: true },
  interest:   { type: String, trim: true },   // Area of interest
  message:    { type: String, trim: true },
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('Enquiry', enquirySchema);
