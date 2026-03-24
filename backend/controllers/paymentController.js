import pool from '../db.js';

export const getPaymentsByMonth = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: 'Month parameter is required (format: YYYY-MM)' });
    const result = await pool.query(
      `select p.id, p.flat_id, p.month, p.amount, p.payment_mode, p.status, p.payment_date,
              f.flat_number, f.flat_type, u.name as owner_name, u.phone as owner_phone
       from payments p
       join flats f ON p.flat_id = f.id
       left join users u ON u.flat_id = f.id AND u.is_deleted = false
       where p.month = $1 ORDER BY f.flat_number`,
      [month]
    );
    res.json({ success: true, payments: result.rows });
    // console.log(result.rows)   


  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

export const createManualPayment = async (req, res) => {
  try {
    const { flat_id, month, amount, payment_mode } = req.body;


    if (!flat_id || !month || !amount || !payment_mode) 
      return res.status(400).json({ error: 'Missing required fields' });

    const flatCheck = await pool.query('select id from flats where id = $1', [flat_id]);

    if (flatCheck.rows.length === 0) 
      return res.status(404).json({ error: 'Flat not found' });


    const result = await pool.query(
      `insert INTO payments (flat_id, month, amount, payment_mode, status, payment_date)
       VALUES ($1, $2, $3, $4, 'paid', CURRENT_TIMESTAMP) RETURNING *`,
      [flat_id, month, amount, payment_mode]
    );
        // console.log(result.rows)
    res.status(201).json({ success: true, payment: result.rows[0] });


  } catch (error) {

    if (error.code === '23505')
       return res.status(400).json({ error: 'Payment for this month already exists' });

    // console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

export const verifyOnlinePayment = async (req, res) => {
  try {
    const { flat_id, month, amount, payment_id, payment_mode } = req.body;
    if (!flat_id || !month || !amount || !payment_id)
       return res.status(400).json({ error: 'Missing required fields' });

    const result = await pool.query(
      `insert INTO payments (flat_id, month, amount, payment_mode, status, payment_date)
       VALUES ($1, $2, $3, $4, 'paid', CURRENT_TIMESTAMP) RETURNING *`,
      [flat_id, month, amount, payment_mode ]
    );
    res.json({ success: true, payment: result.rows[0] });
  } catch (error) {
    if (error.code === '23505')
       return res.status(400).json({ error: 'Payment for this month already exists' });

    
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};
