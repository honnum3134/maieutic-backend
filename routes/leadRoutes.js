const express    = require('express');
const router     = express.Router();
const Lead       = require('../models/Lead');
const sendEmail  = require('../middleware/mailer');
const requireKey = require('../middleware/requireKey');

/* POST /api/lead — homepage LeadPopup */
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, source, page } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ success: false, error: 'Name, phone and email are required.' });
    }

    const lead = new Lead({ name, phone, email, source, page });
    await lead.save();

    // Notification is best-effort: the lead is already stored, so a mail
    // failure must not turn a successful capture into an error for the visitor.
    try {
      await sendEmail(
        process.env.HR_EMAIL,
        `⭐ New Website Lead from ${name}`,
        `
          <h2 style="color:#00615c">New Lead Captured (Website Popup)</h2>
          <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif">
            <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Name</td><td style="padding:10px">${name}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">Phone</td><td style="padding:10px">${phone}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Email</td><td style="padding:10px">${email}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">Page</td><td style="padding:10px">${page || '—'}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Submitted At</td><td style="padding:10px">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
          </table>
        `
      );
    } catch (mailErr) {
      console.error('Lead notification email failed:', mailErr.message);
    }

    res.status(201).json({ success: true, message: 'Lead captured successfully!' });

  } catch (err) {
    console.error('Lead route error:', err.message);
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

/* GET /api/lead?key=… — JSON list (key-protected) */
router.get('/', requireKey, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json({ success: true, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
