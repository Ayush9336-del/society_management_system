import pool from '../db.js';

export const getAllFlats = async (req, res) => {
  try {
    const result = await pool.query(`
      select f.id, f.flat_number, f.flat_type, f.created_at,
             u.id as resident_id, u.name as resident_name,
             u.email as resident_email, u.phone as resident_phone, u.role as resident_role,
             CASE WHEN u.id IS NOT NULL THEN true ELSE false END as is_assigned
      from flats f
      left JOIN users u ON u.flat_id = f.id AND u.is_deleted = false
      ORDER BY f.flat_number
    `);
    res.json({ success: true, flats: result.rows });
  } catch (error) {
    console.error('Get flats error:', error);
    res.status(500).json({ error: 'Failed to fetch flats' });
  }
};

export const createFlat = async (req, res) => {
  try {
    const { flat_number, flat_type } = req.body;
    if (!flat_number || !flat_type) return res.status(400).json({ error: 'flat_number and flat_type are required' });
    const result = await pool.query(
      `insert into flats (flat_number, flat_type) VALUES ($1, $2) RETURNING *`,
      [flat_number, flat_type]
    );
    res.status(201).json({ success: true, flat: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'Flat number already exists' });
    console.error('Create flat error:', error);
    res.status(500).json({ error: 'Failed to create flat' });
  }
};

export const updateFlat = async (req, res) => {
  try {
    const { id } = req.params;
    const { flat_number, flat_type } = req.body;
    const result = await pool.query(
      `update flats SET flat_number = COALESCE($1, flat_number), flat_type = COALESCE($2, flat_type)
       where id = $3 RETURNING *`,
      [flat_number, flat_type, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Flat not found' });
    res.json({ success: true, flat: result.rows[0] });
  } catch (error) {
    console.error('Update flat error:', error);
    res.status(500).json({ error: 'Failed to update flat' });
  }
};

export const vacateFlat = async (req, res) => {
  try {
    const { id } = req.params;
    const flatCheck = await pool.query('select id from flats where id = $1', [id]);
    if (flatCheck.rows.length === 0) return res.status(404).json({ error: 'Flat not found' });
    await pool.query('update users SET flat_id = NULL where flat_id = $1 AND is_deleted = false', [id]);
    res.json({ success: true, message: 'Flat vacated successfully' });
  } catch (error) {
    console.error('Vacate flat error:', error);
    res.status(500).json({ error: 'Failed to vacate flat' });
  }
};

export const assignResident = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id is required' });

    const occupied = await pool.query('select id from users where flat_id = $1 AND is_deleted = false', [id]);
    if (occupied.rows.length > 0) return res.status(400).json({ error: 'Flat is already assigned. Vacate it first.' });

    await pool.query('update users SET flat_id = $1 where id = $2', [id, user_id]);
    res.json({ success: true, message: 'Resident assigned successfully' });
  } catch (error) {
    console.error('Assign resident error:', error);
    res.status(500).json({ error: 'Failed to assign resident' });
  }
};
