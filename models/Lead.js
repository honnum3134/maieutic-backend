const mongoose = require('mongoose');

// Captured by the homepage LeadPopup ("Let's Connect!") — name, phone, email only.
const leadSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  phone:     { type: String, required: true, trim: true },
  email:     { type: String, required: true, trim: true, lowercase: true },
  source:    { type: String, default: 'popup', trim: true }, // which widget/page raised the lead
  page:      { type: String, trim: true },                   // URL the visitor was on
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Lead', leadSchema);
