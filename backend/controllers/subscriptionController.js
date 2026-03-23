import pool from '../db.js';

export const getAllSubscriptions = async (req, res) => {
  try {
    const result = await pool.query('select * from subscription_plans ORDER BY flat_type');
    res.json({ success: true, subscriptions: result.rows });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { monthly_amount } = req.body;
    if (!monthly_amount || monthly_amount <= 0) return res.status(400).json({ error: 'Invalid monthly amount' });
    const result = await pool.query(
      'update subscription_plans SET monthly_amount = $1 where id = $2 RETURNING *',
      [monthly_amount, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Subscription plan not found' });
    res.json({ success: true, subscription: result.rows[0] });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};
