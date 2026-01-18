const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Database Connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Password123!', 
    database: 'unep_portal_v2'
});

db.connect(err => {
    if (err) console.log('DB Error: ', err.message);
    else console.log('Connected to MySQL Database');
});

// LOGIN
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, result) => {
        if (err) res.status(500).json(err);
        else if (result.length > 0) res.json({ success: true, user: result[0] });
        else res.status(401).json({ success: false, message: 'Invalid Credentials' });
    });
});

// GET LOOKUP DATA (Dropdowns)
app.get('/api/lookups', (req, res) => {
    db.query('SELECT * FROM duty_stations', (e, stations) => {
        db.query('SELECT * FROM education_levels', (e, edu) => {
            res.json({ stations, edu });
        });
    });
});

// GET STAFF (Search)
app.get('/api/staff', (req, res) => {
    const search = req.query.q ? `%${req.query.q}%` : '%';
    const sql = `
        SELECT s.*, d.name as duty_station, e.level_name as education 
        FROM staff s
        LEFT JOIN duty_stations d ON s.duty_station_id = d.id
        LEFT JOIN education_levels e ON s.education_id = e.id
        WHERE s.full_names LIKE ? OR s.index_number LIKE ?
    `;
    db.query(sql, [search, search], (err, results) => {
        if (err) res.status(500).json(err);
        else res.json(results);
    });
});

// ADD STAFF
app.post('/api/staff', (req, res) => {
    const { index, name, email, stationId, eduId, remote } = req.body;
    db.query('INSERT INTO staff (index_number, full_names, email, duty_station_id, education_id, remote_available) VALUES (?,?,?,?,?,?)',
    [index, name, email, stationId, eduId, remote], (err, result) => {
        if (err) res.status(400).json(err);
        else res.json({ id: result.insertId });
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));