import pool from '../db.js';

export const getDashboard = async (req, res) => {
  try {
    const stats = await pool.query(`
      select
        (select count(*) from flats) as total_flats,
        (select count(*) from users where is_deleted = false AND role = 'user') as total_residents,
        (select count(*) from users where is_deleted = false AND flat_id IS not NULL AND role = 'user') as assigned_residents,
        (select COALESCE(SUM(amount), 0) from payments where status = 'paid') as total_collected,
        (select COALESCE(SUM(sp.monthly_amount), 0)
         from users u
         join flats f ON u.flat_id = f.id
         join subscription_plans sp ON sp.flat_type = f.flat_type
         where u.is_deleted = false
           AND not EXISTS (
             select 1 from payments p
             where p.flat_id = f.id
               AND p.month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
               AND p.status = 'paid'
           )
        ) as pending_amount,
        (select COALESCE(SUM(amount), 0) from payments
         where status = 'paid'
         AND month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')) as monthly_revenue
    `);

    const recentPayments = await pool.query(`
      select p.id, p.month, p.amount, p.status, p.payment_mode, p.payment_date,
             f.flat_number, u.name as resident_name
      from payments p
      join flats f ON p.flat_id = f.id
      left join users u ON u.flat_id = f.id AND u.is_deleted = false
      where p.status = 'paid'
      ORDER BY p.payment_date DESC
      LIMIT 8
    `);

    const monthlyTrend = await pool.query(`
      select month, COALESCE(SUM(amount), 0) as collected
      from payments
      where status = 'paid'
        AND month >= TO_CHAR(CURRENT_DATE - INTERVAL '5 months', 'YYYY-MM')
      GROUP BY month
      ORDER BY month
    `);

    const paymentModes = await pool.query(`
      select payment_mode, count(*)::int as count, COALESCE(SUM(amount), 0) as total
      from payments
      where status = 'paid'
      GROUP BY payment_mode
    `);

    const currentMonthStatus = await pool.query(`
      select
        count(*) FILTER (where p.id IS not NULL) as paid,
        count(*) FILTER (where p.id IS NULL) as unpaid
      from users u
      join flats f ON u.flat_id = f.id
      left join payments p ON p.flat_id = f.id
        AND p.month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
        AND p.status = 'paid'
      where u.is_deleted = false
    `);

    res.json({
      success: true,
      dashboard: stats.rows[0],
      recent_payments: recentPayments.rows,
      monthly_trend: monthlyTrend.rows,
      payment_modes: paymentModes.rows,
      current_month_status: currentMonthStatus.rows[0],
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

export const getResidents = async (req, res) => {
  try {
    const result = await pool.query(
      `select u.id, u.name, u.email, u.phone, u.role, u.created_at,
              f.flat_number, f.flat_type
       from users u
       left join flats f ON u.flat_id = f.id
       where u.is_deleted = false
       ORDER BY u.created_at DESC`
    );
    res.json({ success: true, residents: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch residents' });
  }
};

export const addResident = async (req, res) => {
  try {
    const { name, email, phone, flat_id } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
    const result = await pool.query(
      `insert into users (name, email, phone, flat_id, role)
       VALUES ($1, $2, $3, $4, 'user') RETURNING id, name, email, phone, flat_id, role`,
      [name, email, phone || null, flat_id || null]
    );
    res.status(201).json({ success: true, resident: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'A user with this email already exists' });
    res.status(500).json({ error: 'Failed to add resident' });
  }
};

export const updateResident = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
    const result = await pool.query(
      `update users SET name = $1, email = $2, phone = $3, role = $4
       where id = $5 AND is_deleted = false
       RETURNING id, name, email, phone, role, flat_id`,
      [name, email, phone || null, role || 'user', id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Resident not found' });
    res.json({ success: true, resident: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'A user with this email already exists' });
    res.status(500).json({ error: 'Failed to update resident' });
  }
};

export const deleteResident = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE users SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP, flat_id = NULL
       where id = $1 AND role = 'user' AND is_deleted = false RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Resident not found' });
    res.json({ success: true, message: 'Resident removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove resident' });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { message, user_id } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const result = await pool.query(
      'insert INTO notifications (message, user_id) VALUES ($1, $2) RETURNING *',
      [message, user_id || null]
    );
    res.status(201).json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `select n.*, u.name as recipient_name, u.email as recipient_email
       from notifications n
       left join users u ON n.user_id = u.id
       ORDER BY n.created_at DESC`
    );
    res.json({ success: true, notifications: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const getReports = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentYear = new Date().getFullYear().toString();
    const result = await pool.query(`
      select
        (select COALESCE(SUM(sp.monthly_amount), 0)
         from users u join flats f ON u.flat_id = f.id
         join subscription_plans sp ON sp.flat_type = f.flat_type
         where u.is_deleted = false) as monthly_expected,
        (select COALESCE(SUM(amount), 0) from payments
         where status = 'paid' AND month = $1) as monthly_collected,
        (select COALESCE(SUM(sp.monthly_amount), 0)
         from users u join flats f ON u.flat_id = f.id
         join subscription_plans sp ON sp.flat_type = f.flat_type
         where u.is_deleted = false
           AND not EXISTS (
             select 1 from payments p
             where p.flat_id = f.id AND p.month = $1 AND p.status = 'paid'
           )) as monthly_pending,
        (select COALESCE(SUM(amount), 0) from payments
         where status = 'paid' AND month LIKE $2) as yearly_collected
    `, [currentMonth, `${currentYear}%`]);
    res.json({ success: true, report: result.rows[0], month: currentMonth, year: currentYear });
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

export const getMonthlyRecords = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: 'month query param required (YYYY-MM)' });
    const result = await pool.query(
      `select
         f.id as flat_id, f.flat_number, f.flat_type,
         u.name as resident_name, u.phone as resident_phone,
         sp.monthly_amount, sp.monthly_amount as amount_due,
         p.id as payment_id, p.amount as amount_paid,
         p.payment_mode, p.transaction_id, p.payment_date,
         CASE WHEN p.id IS not NULL THEN 'paid' ELSE 'unpaid' END as status
       from flats f
       left join users u ON u.flat_id = f.id AND u.is_deleted = false
       left join subscription_plans sp ON sp.flat_type = f.flat_type
       left join payments p ON p.flat_id = f.id AND p.month = $1 AND p.status = 'paid'
       ORDER BY f.flat_number`,
      [month]
    );
    res.json({ success: true, records: result.rows, month });
  } catch (error) {
    console.error('Monthly records error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly records' });
  }
};
