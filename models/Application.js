const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  fullName:    { type: String, required: true, trim: true },
  email:       { type: String, required: true, trim: true, lowercase: true },
  phone:       { type: String, required: true, trim: true },
  role:        { type: String, required: true, trim: true },
  experience:  { type: String, trim: true },
  linkedin:    { type: String, trim: true },
  coverLetter: { type: String, trim: true },
  resumePath:  { type: String },               // path to uploaded resume file
  resumeName:  { type: String },               // original filename
  status:      { type: String, default: 'Pending', enum: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'] },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', applicationSchema);
