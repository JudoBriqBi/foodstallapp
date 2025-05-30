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
    const query = 'SELECT * FROM USERS WHERE name = $1 AND password = $2';
    const values = [username, password];
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Login successful', user: result.rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
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

// Get all menu items
router.get('/menu-items', async (req, res) => {
  try {
    const query = 'SELECT * FROM menu_items ORDER BY id ASC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new menu item
router.post('/menu-items', async (req, res) => {
  const { name, price, image, isVeg, isAvailable } = req.body;
  try {
    const query = `
      INSERT INTO menu_items (name, price, image, is_veg, is_available)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [name, price, image, isVeg, isAvailable];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update menu item
router.put('/menu-items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, image, isVeg, isAvailable } = req.body;
  try {
    const query = `
      UPDATE menu_items
      SET name = $1, price = $2, image = $3, is_veg = $4, is_available = $5
      WHERE id = $6
      RETURNING *
    `;
    const values = [name, price, image, isVeg, isAvailable, id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete menu item
router.delete('/menu-items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM menu_items WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update menu item availability
router.patch('/menu-items/:id/availability', async (req, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;
  try {
    const query = `
      UPDATE menu_items
      SET is_available = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [isAvailable, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating menu item availability:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
