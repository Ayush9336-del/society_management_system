import pool from '../db.js';

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const userResult = await pool.query(
      `select u.*, f.flat_number, f.flat_type, sp.monthly_amount
       from users u
       left join flats f ON u.flat_id = f.id
       left join subscription_plans sp ON f.flat_type = sp.flat_type
       where u.id = $1`,
      [userId]
    );
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = userResult.rows[0];
    if (!user.flat_id) {
      return res.json({ success: true, user: { name: user.name, email: user.email }, message: 'No flat assigned yet' });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentBill    = await pool.query(`select * from payments where flat_id = $1 AND month = $2`, [user.flat_id, currentMonth]);
    const pendingPayments = await pool.query(`select * from payments where flat_id = $1 AND status = 'pending' ORDER BY month DESC`, [user.flat_id]);
    const paymentHistory  = await pool.query(`select * from payments where flat_id = $1 ORDER BY month DESC LIMIT 12`, [user.flat_id]);

    res.json({
      success: true,
      user: { name: user.name, email: user.email, flat_number: user.flat_number, flat_type: user.flat_type, monthly_amount: user.monthly_amount },
      current_bill: currentBill.rows[0] || null,
      pending_payments: pendingPayments.rows,
      payment_history: paymentHistory.rows,
    });
  } catch (error) {
    console.error('User dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

export const pay = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, payment_mode } = req.body;
    if (!month || !payment_mode) return res.status(400).json({ error: 'month and payment_mode are required' });

    const userResult = await pool.query(
      `select u.flat_id, sp.monthly_amount
       from users u
       join flats f ON u.flat_id = f.id
       join subscription_plans sp ON f.flat_type = sp.flat_type
       where u.id = $1 AND u.is_deleted = false`,
      [userId]
    );
    if (userResult.rows.length === 0 || !userResult.rows[0].flat_id) {
      return res.status(400).json({ error: 'No flat assigned to your account' });
    }

    const { flat_id, monthly_amount } = userResult.rows[0];
    const transaction_id = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const result = await pool.query(
      `INSERT INTO payments (flat_id, month, amount, payment_mode, transaction_id, status, payment_date)
       VALUES ($1, $2, $3, $4, $5, 'paid', CURRENT_TIMESTAMP) RETURNING *`,
      [flat_id, month, monthly_amount, payment_mode, transaction_id]
    );
    res.status(201).json({ success: true, payment: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'Payment for this month already exists' });
    console.error('User pay error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await pool.query(
      `select p.*, f.flat_number, f.flat_type, u.name as resident_name, u.email as resident_email, u.phone as resident_phone
       from payments p
       join flats f ON p.flat_id = f.id
       join users u ON u.id = $1
       where p.id = $2 AND u.flat_id = p.flat_id`,
      [userId, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json({ success: true, payment: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userResult = await pool.query('select flat_id from users where id = $1', [userId]);
    if (userResult.rows.length === 0 || !userResult.rows[0].flat_id) {
      return res.status(404).json({ error: 'No flat assigned' });
    }
    const payments = await pool.query(
      `select * from payments where flat_id = $1 ORDER BY month DESC`,
      [userResult.rows[0].flat_id]
    );
    res.json({ success: true, subscriptions: payments.rows });
  } catch (error) {
    console.error('User subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `select * from notifications where user_id IS NULL OR user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ success: true, notifications: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};
