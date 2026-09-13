const express     = require('express');
const router      = express.Router();
const multer      = require('multer');
const fs          = require('fs');
const { Resend }  = require('resend');
const Application = require('../models/Application');
const requireKey = require('../middleware/requireKey');
const upload      = require('../middleware/upload');

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/', (req, res) => {
  upload.single('resume')(req, res, async (err) => {

    // Handle Multer errors cleanly
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: 'File too large. Maximum size is 5MB.' });
    }
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    try {
      const { fullName, email, phone, role, experience, linkedin, coverLetter } = req.body;

      if (!fullName || !email || !phone || !role) {
        return res.status(400).json({ success: false, error: 'Full name, email, phone and role are required.' });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Resume file is required.' });
      }

      // 1. Save to MongoDB (removed localhost resumePath)
      const application = new Application({
        fullName, email, phone, role, experience,
        linkedin, coverLetter,
        resumeName: req.file.originalname,
      });
      await application.save();

      // 2. Read file buffer for email attachment
      const fileBuffer = fs.readFileSync(req.file.path);

      // 3. Send email with resume attached
      await resend.emails.send({
        from: 'Maieutic Edutech <info@maieuticedutech.com>',
        to: process.env.HR_EMAIL,
        subject: `📄 New Job Application — ${role} — ${fullName}`,
        html: `
          <h2 style="color:#00615c;font-family:Arial,sans-serif">New Job Application Received</h2>
          <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif">
            <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Full Name</td><td style="padding:10px">${fullName}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">Email</td><td style="padding:10px">${email}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Phone</td><td style="padding:10px">${phone}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">Role Applied</td><td style="padding:10px">${role}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Experience</td><td style="padding:10px">${experience || '—'}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">LinkedIn</td><td style="padding:10px">${linkedin || '—'}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Cover Letter</td><td style="padding:10px">${coverLetter || '—'}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">Resume</td><td style="padding:10px">Attached below ⬇️</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Submitted At</td><td style="padding:10px">${new Date().toLocaleString('en-IN')}</td></tr>
          </table>
        `,
        attachments: [{
          filename: req.file.originalname,
          content:  fileBuffer,
        }],
      });

      // 4. Clean up temp file
      fs.unlinkSync(req.file.path);

      res.status(201).json({ success: true, message: 'Application submitted successfully!' });

    } catch (err) {
      console.error('Application route error:', err.message);
      res.status(500).json({ success: false, error: 'Server error. Please try again.' });
    }
  });
});

router.get('/', requireKey, async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;