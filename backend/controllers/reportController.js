import pool from '../db.js';

export const getMonthlyReport = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: 'Month parameter is required (format: YYYY-MM)' });
    const result = await pool.query(
      `select count(*) as total_payments,
              SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_collected,
              SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
              count(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
              count(CASE WHEN status = 'pending' THEN 1 END) as pending_count
       FROM payments where month = $1`,
      [month]
    );
    res.json({ success: true, report: result.rows[0] });
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({ error: 'Failed to generate monthly report' });
  }
};

export const getYearlyReport = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ error: 'Year parameter is required (format: YYYY)' });
    const result = await pool.query(
      `select month, count(*) as total_payments,
              SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as collected,
              SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending
       FROM payments where month LIKE $1 GROUP BY month ORDER BY month`,
      [`${year}%`]
    );
    const summary = await pool.query(
      `select SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_collected,
              count(CASE WHEN status = 'paid' THEN 1 END) as total_paid_count
       FROM payments where month LIKE $1`,
      [`${year}%`]
    );
    res.json({ success: true, monthly_breakdown: result.rows, summary: summary.rows[0] });
  } catch (error) {
    console.error('Yearly report error:', error);
    res.status(500).json({ error: 'Failed to generate yearly report' });
  }
};
