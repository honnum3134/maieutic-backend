/* ─── GET /leadssheet?key=…  →  Maieutic_Leads_<date>.xlsx ───
 * One workbook, four sheets, one per capture point:
 *   1. Apply Now     (Application model — careers form + sticky Apply Now)
 *   2. Contact Us    (Contact model     — /contact page)
 *   3. Enquire Now   (Enquiry model     — sticky Enquire Now widget)
 *   4. Lead Popup    (Lead model        — homepage "Let's Connect!" popup)
 *
 * Typing the URL in a browser downloads the file directly. The route is
 * protected by middleware/requireKey.js; see README for the key.
 */
const express     = require('express');
const router      = express.Router();
const ExcelJS     = require('exceljs');
const Application = require('../models/Application');
const Contact     = require('../models/Contact');
const Enquiry     = require('../models/Enquiry');
const Lead        = require('../models/Lead');
const requireKey  = require('../middleware/requireKey');

const BRAND_TEAL  = 'FF00615C';
const BRAND_CREAM = 'FFFEF1DE';

const istDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true, timeZone: 'Asia/Kolkata',
      })
    : '';

/* Sheet definitions: column header, width, and how to read the value. */
const SHEETS = [
  {
    name: 'Apply Now',
    model: Application,
    columns: [
      { header: 'Full Name',     width: 26, get: (r) => r.fullName },
      { header: 'Email',         width: 32, get: (r) => r.email },
      { header: 'Phone',         width: 16, get: (r) => r.phone },
      { header: 'Role Applied',  width: 26, get: (r) => r.role },
      { header: 'Experience',    width: 16, get: (r) => r.experience },
      { header: 'LinkedIn',      width: 40, get: (r) => r.linkedin },
      { header: 'Cover Letter',  width: 60, get: (r) => r.coverLetter, wrap: true },
      { header: 'Resume File',   width: 30, get: (r) => r.resumeName },
      { header: 'Status',        width: 14, get: (r) => r.status },
    ],
  },
  {
    name: 'Contact Us',
    model: Contact,
    columns: [
      { header: 'Name',    width: 26, get: (r) => r.name },
      { header: 'Email',   width: 32, get: (r) => r.email },
      { header: 'Subject', width: 30, get: (r) => r.subject },
      { header: 'Message', width: 60, get: (r) => r.message, wrap: true },
    ],
  },
  {
    name: 'Enquire Now',
    model: Enquiry,
    columns: [
      { header: 'Name',             width: 26, get: (r) => r.name },
      { header: 'Email',            width: 32, get: (r) => r.email },
      { header: 'Phone',            width: 16, get: (r) => r.phone },
      { header: 'Area of Interest', width: 28, get: (r) => r.interest },
      { header: 'Message',          width: 60, get: (r) => r.message, wrap: true },
    ],
  },
  {
    name: 'Lead Popup',
    model: Lead,
    columns: [
      { header: 'Name',   width: 26, get: (r) => r.name },
      { header: 'Phone',  width: 16, get: (r) => r.phone },
      { header: 'Email',  width: 32, get: (r) => r.email },
      { header: 'Page',   width: 40, get: (r) => r.page },
    ],
  },
];

const buildSheet = (workbook, def, rows) => {
  const ws = workbook.addWorksheet(def.name, {
    views: [{ state: 'frozen', ySplit: 1 }], // keep the header row visible
  });

  const columns = [
    { header: 'S.No', key: 'sno', width: 7 },
    ...def.columns.map((c, i) => ({ header: c.header, key: 'c' + i, width: c.width })),
    { header: 'Submitted At (IST)', key: 'submittedAt', width: 26 },
  ];
  ws.columns = columns;

  rows.forEach((r, idx) => {
    const row = { sno: idx + 1, submittedAt: istDate(r.createdAt) };
    def.columns.forEach((c, i) => { row['c' + i] = c.get(r) ?? ''; });
    ws.addRow(row);
  });

  // Header styling — brand teal band, cream bold text.
  const header = ws.getRow(1);
  header.height = 22;
  header.eachCell((cell) => {
    cell.font      = { bold: true, color: { argb: BRAND_CREAM }, size: 11 };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_TEAL } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border    = { bottom: { style: 'thin', color: { argb: 'FF004D49' } } };
  });

  // Wrap long-text columns so messages stay readable.
  def.columns.forEach((c, i) => {
    if (c.wrap) ws.getColumn('c' + i).alignment = { wrapText: true, vertical: 'top' };
  });
  ws.getColumn('sno').alignment = { horizontal: 'center', vertical: 'top' };

  // Filter dropdowns on every column.
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to:   { row: 1, column: columns.length },
  };
};

router.get('/', requireKey, async (req, res) => {
  try {
    // Newest first in every sheet; all four queries run in parallel.
    const results = await Promise.all(
      SHEETS.map((s) => s.model.find().sort({ createdAt: -1 }).lean())
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Maieutic Edutech Website';
    workbook.created = new Date();

    SHEETS.forEach((def, i) => buildSheet(workbook, def, results[i]));

    const today    = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
    const filename = `Maieutic_Leads_${today}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('Leads export error:', err.message);
    res.status(500).json({ success: false, error: 'Could not generate the leads sheet.' });
  }
});

module.exports = router;
