const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
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
  ssl: { rejectUnauthorized: false },
  max: 10, // Limit the number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Timeout for new connections
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

// Handle unexpected errors on the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  process.exit(-1); // Exit the process to avoid undefined behavior
});

// Middleware to parse JSON
app.use(express.json());

// Enable CORS for localhost and the frontend URL
const allowedOrigins = ['http://localhost:5173', 'https://judopersonals.web.app','https://ncet.nagarjunatechsolutions.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

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

const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');

// Use routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});