const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
require('dotenv').config();

/* ─── Startup checks ───
 * Must run before the routes are required: the Resend client throws at load
 * time when RESEND_API_KEY is missing, and this message is clearer.
 */
const missing = ['MONGO_URI', 'RESEND_API_KEY', 'HR_EMAIL'].filter((k) => !process.env[k]);
if (missing.length) {
  console.error('❌ Missing required environment variables: ' + missing.join(', '));
  process.exit(1);
}

const app = express();

/* ─── CORS ───
 * FRONTEND_URL may hold one origin or a comma-separated list, e.g.
 *   FRONTEND_URL=https://maieuticedutech.com,https://www.maieuticedutech.com
 * The production site and localhost are always allowed so a missing or
 * mistyped variable on Railway can never take the public forms down again.
 */
const DEFAULT_ORIGINS = [
  'https://maieuticedutech.com',
  'https://www.maieuticedutech.com',
  'http://localhost:3000',
];

const allowedOrigins = new Set([
  ...DEFAULT_ORIGINS,
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean),
]);

app.use(cors({
  origin: (origin, callback) => {
    // No Origin header = server-to-server call, curl, or Railway health check.
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    console.warn('CORS blocked origin:', origin);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─── Routes ─── */
app.use('/api/contact',     require('./routes/contactRoutes'));
app.use('/api/enquiry',     require('./routes/enquiryRoutes'));
app.use('/api/application', require('./routes/applicationRoutes'));

/* ─── Health checks ─── */
const health = (req, res) => {
  res.json({
    status: 'ok',
    service: 'maieutic-backend',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
};
app.get('/', health);
app.get('/health', health);

/* ─── Connect DB & Start Server ─── */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log('✅ Server running on port ' + PORT);
      console.log('✅ Allowed CORS origins: ' + [...allowedOrigins].join(', '));
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
