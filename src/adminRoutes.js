const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: false },
});

// Admin login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const query = 'SELECT * FROM USERS WHERE username = $1 AND password = $2';
    const values = [username, password];
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Login successful', user: result.rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all data from orders table
router.get('/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ORDERS');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update data in orders table
router.put('/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Example: updating order status
  try {
    const query = 'UPDATE ORDERS SET status = $1 WHERE id = $2 RETURNING *';
    const values = [status, id];
    const result = await pool.query(query, values);
    res.json({ success: true, updatedOrder: result.rows[0] });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
