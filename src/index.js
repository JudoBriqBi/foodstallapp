const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 3000;

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
});

// Test database connection on server startup
pool.connect()
  .then(() => {
    console.log('Connected to the PostgreSQL database successfully.');
  })
  .catch((error) => {
    console.error('Failed to connect to the PostgreSQL database:', error.message);
    process.exit(1); // Exit the process if the connection fails
  });

// Middleware to parse JSON
app.use(express.json());

// Test endpoint to check database connection
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, timestamp: result.rows[0].now });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM USERS');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});