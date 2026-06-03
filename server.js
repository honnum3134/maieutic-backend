const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const path       = require('path');
require('dotenv').config();

const app = express();

/* ─── Middleware ─── */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Serve uploaded resumes as static files */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ─── Routes ─── */
app.use('/api/contact',     require('./routes/contactRoutes'));
app.use('/api/enquiry',     require('./routes/enquiryRoutes'));
app.use('/api/application', require('./routes/applicationRoutes'));

/* ─── Health check ─── */
app.get('/', (req, res) => {
  res.json({ status: 'Maieutic Backend is running ✅' });
});

/* ─── Connect DB & Start Server ─── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`✅ Server running on http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
