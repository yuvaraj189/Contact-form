import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('📁 "uploads" folder created');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('❌ DB Connection Error:', err);
  } else {
    console.log('✅ Connected to MySQL');
  }
});

// Multer config with file type and size validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const allowedExt = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExt.includes(ext)) {
      return cb(new Error('Only image files (.jpg, .jpeg, .png) are allowed'));
    }
    cb(null, true);
  },
});

// 🔽 GET all non-deleted contacts
app.get('/api/contacts', (req, res) => {
  console.log('📥 GET /api/contacts');
  const sql = 'SELECT * FROM contacts WHERE isDeleted = FALSE ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch contacts' });
    res.json(results);
  });
});

// 🔼 POST add a contact
app.post('/api/contacts', upload.single('picture'), (req, res) => {
  const { firstName, contact, birthday, email } = req.body;
  const picture = req.file ? req.file.filename : null;

  if (!firstName || !contact || !birthday || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'INSERT INTO contacts (firstName, contact, birthday, email, picture) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [firstName, contact, birthday, email, picture], (err) => {
    if (err) {
      console.error('❌ Insert Error:', err);
      return res.status(500).json({ error: 'Database insert error' });
    }
    res.json({ message: '✅ Contact saved successfully' });
  });
});

// ❌ Soft delete contact
app.delete('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE contacts SET isDeleted = TRUE WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete contact' });
    res.json({ message: '🗑️ Contact marked as deleted' });
  });
});

// 🔁 Recover all deleted contacts
app.post('/api/contacts/recover', (req, res) => {
  const sql = 'UPDATE contacts SET isDeleted = FALSE WHERE isDeleted = TRUE';
  db.query(sql, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to recover contacts' });
    res.json({ message: '♻️ All deleted contacts recovered' });
  });
});

// 🔁 Recover a single deleted contact (optional)
app.post('/api/contacts/recover/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE contacts SET isDeleted = FALSE WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to recover contact' });
    res.json({ message: `♻️ Contact ID ${id} recovered` });
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
