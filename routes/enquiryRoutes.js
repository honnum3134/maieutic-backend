const express   = require('express');
const router    = express.Router();
const Enquiry   = require('../models/Enquiry');
const requireKey = require('../middleware/requireKey');
const sendEmail = require('../middleware/mailer');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, interest, message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, error: 'Name, email and phone are required.' });
    }

    const enquiry = new Enquiry({ name, email, phone, interest, message });
    await enquiry.save();

    await sendEmail(
      process.env.HR_EMAIL,
      `🔔 New Enquiry from ${name}`,
      `
        <h2 style="color:#00615c">New Enquiry Received</h2>
        <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif">
          <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Name</td><td style="padding:10px">${name}</td></tr>
          <tr><td style="padding:10px;font-weight:bold">Email</td><td style="padding:10px">${email}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Phone</td><td style="padding:10px">${phone}</td></tr>
          <tr><td style="padding:10px;font-weight:bold">Interest</td><td style="padding:10px">${interest || '—'}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Message</td><td style="padding:10px">${message || '—'}</td></tr>
          <tr><td style="padding:10px;font-weight:bold">Submitted At</td><td style="padding:10px">${new Date().toLocaleString('en-IN')}</td></tr>
        </table>
      `
    );

    res.status(201).json({ success: true, message: 'Enquiry submitted successfully!' });

  } catch (err) {
    console.error('Enquiry route error:', err.message);
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

router.get('/', requireKey, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;