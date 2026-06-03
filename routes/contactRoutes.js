const express   = require('express');
const router    = express.Router();
const Contact   = require('../models/Contact');
const sendEmail = require('../middleware/mailer');

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email and message are required.' });
    }

    const contact = new Contact({ name, email, subject, message });
    await contact.save();

    await sendEmail(
      process.env.HR_EMAIL,
      `📬 New Contact Form: ${subject || 'No Subject'}`,
      `
        <h2 style="color:#00615c">New Contact Form Submission</h2>
        <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif">
          <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Name</td><td style="padding:10px">${name}</td></tr>
          <tr><td style="padding:10px;font-weight:bold">Email</td><td style="padding:10px">${email}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Subject</td><td style="padding:10px">${subject || '—'}</td></tr>
          <tr><td style="padding:10px;font-weight:bold">Message</td><td style="padding:10px">${message}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Submitted At</td><td style="padding:10px">${new Date().toLocaleString('en-IN')}</td></tr>
        </table>
      `
    );

    res.status(201).json({ success: true, message: 'Message sent successfully!' });

  } catch (err) {
    console.error('Contact route error:', err.message);
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;