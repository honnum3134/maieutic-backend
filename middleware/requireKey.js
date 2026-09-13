/* ─── Access key guard for the lead-data endpoints ───
 * The Excel export and the JSON list endpoints expose personal data, so they
 * must never be open to the public. The key is read from the LEADS_SHEET_KEY
 * environment variable and can be supplied either as
 *   ?key=<value>            — so the URL can be typed straight into a browser
 *   x-leads-key: <value>    — header, for scripts
 *
 * If LEADS_SHEET_KEY is not configured the routes refuse every request
 * (503) rather than silently leaking data. The public POST routes are not
 * affected, so a missing variable can never take the website forms down.
 */
const requireKey = (req, res, next) => {
  const expected = process.env.LEADS_SHEET_KEY;
  if (!expected) {
    return res.status(503).json({
      success: false,
      error: 'Lead export is not configured on the server (LEADS_SHEET_KEY missing).',
    });
  }

  const supplied = req.query.key || req.get('x-leads-key');
  if (!supplied || supplied !== expected) {
    return res.status(401).json({ success: false, error: 'Invalid or missing access key.' });
  }
  next();
};

module.exports = requireKey;
