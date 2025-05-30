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

// Save data to orders table
router.post('/orders', async (req, res) => {
  const {
    userName,
    phoneNo,
    roomNo,
    tableNo,
    orderId,
    orderedItems
  } = req.body;

  try {
    const query = `INSERT INTO orders (order_id, user_name, phone_no, room_no, table_no, ordered_items) 
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [orderId, userName, phoneNo, roomNo, tableNo, JSON.stringify(orderedItems)];
    const result = await pool.query(query, values);
    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
