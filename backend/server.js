const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// --- CONFIGURATION ---
const PORT = 5003; 
const UN_BLUE = '\x1b[36m'; 

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'] }));
app.use(express.json());

// --- DATABASE CONNECTION ---
const db = mysql.createConnection({
    host: '127.0.0.1', 
    user: 'root', 
    password: 'Password123!', 
    database: 'unep_portal_v2',
    multipleStatements: true
});

db.connect(err => {
    if (err) {
        console.error('DB Connection Failed. Ensure MySQL is running.');
    } else {
        console.log(`${UN_BLUE}Connected to UN Enterprise Database on 127.0.0.1:${PORT}${UN_BLUE}`);
        initializeDatabase(); 
    }
});

// --- AUTO-INITIALIZATION ---
function initializeDatabase() {
    const initSql = `
        CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50), password VARCHAR(50), role VARCHAR(20) DEFAULT 'admin', staff_index VARCHAR(50));
        CREATE TABLE IF NOT EXISTS duty_stations (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100));
        CREATE TABLE IF NOT EXISTS education_levels (id INT AUTO_INCREMENT PRIMARY KEY, level_name VARCHAR(100));
        CREATE TABLE IF NOT EXISTS staff (id INT AUTO_INCREMENT PRIMARY KEY, index_number VARCHAR(50), full_names VARCHAR(150), email VARCHAR(150), duty_station_id INT, education_id INT, remote_available BOOLEAN DEFAULT TRUE, current_location VARCHAR(100));
        CREATE TABLE IF NOT EXISTS trainings (id INT AUTO_INCREMENT PRIMARY KEY, course_name VARCHAR(150), description TEXT, duration_hours INT);
        CREATE TABLE IF NOT EXISTS staff_trainings (id INT AUTO_INCREMENT PRIMARY KEY, staff_id INT, training_id INT, status VARCHAR(50) DEFAULT 'Assigned', assigned_date DATE DEFAULT (CURRENT_DATE));
        CREATE TABLE IF NOT EXISTS shifts (id INT AUTO_INCREMENT PRIMARY KEY, staff_id INT, shift_date DATE, shift_type VARCHAR(50));

        -- Seed Defaults
        INSERT IGNORE INTO users (id, username, password, role) VALUES (1, 'admin', 'admin123', 'admin');
        INSERT IGNORE INTO duty_stations (id, name) VALUES (1, 'Nairobi (UNON)'), (2, 'Geneva (UNOG)'), (3, 'New York (UNHQ)'), (4, 'Vienna (UNOV)'), (5, 'Bangkok (ESCAP)');
        INSERT IGNORE INTO education_levels (id, level_name) VALUES (1, 'P-1 / Bachelor'), (2, 'P-3 / Master'), (3, 'P-5 / PhD');
        INSERT IGNORE INTO trainings (id, course_name, description, duration_hours) VALUES 
        (1, 'BSITF: Basic Security', 'Mandatory security awareness.', 4),
        (2, 'Ethics and Integrity', 'Standards of conduct.', 2),
        (3, 'Prevention of Sexual Harassment', 'Zero tolerance policy.', 3);
    `;
    db.query(initSql, (err) => { if(err) console.log("Init Error:", err.message); else console.log("Database Verified."); });
}

// --- API ROUTES ---

// Auth
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, result) => {
        if (result.length > 0) res.json({ success: true, user: result[0] });
        else res.status(401).json({ success: false, message: 'Invalid Credentials' });
    });
});

// Lookups
app.get('/api/lookups', (req, res) => {
    db.query('SELECT * FROM duty_stations', (e, stations) => {
        db.query('SELECT * FROM education_levels', (e, edu) => {
            res.json({ stations: stations || [], edu: edu || [] });
        });
    });
});
app.post('/api/duty-stations', (req, res) => {
    db.query('INSERT INTO duty_stations (name) VALUES (?)', [req.body.name], (e, r) => res.json(r));
});

// Staff Management
app.get('/api/staff', (req, res) => {
    const search = req.query.q ? `%${req.query.q}%` : '%';
    const sql = `SELECT s.*, d.name as duty_station, e.level_name as education FROM staff s LEFT JOIN duty_stations d ON s.duty_station_id = d.id LEFT JOIN education_levels e ON s.education_id = e.id WHERE s.full_names LIKE ? OR s.index_number LIKE ?`;
    db.query(sql, [search, search], (err, results) => res.json(results || []));
});
app.post('/api/staff', (req, res) => {
    const { index, name, email, stationId, eduId, remote } = req.body;
    db.query('INSERT INTO staff (index_number, full_names, email, duty_station_id, education_id, remote_available) VALUES (?,?,?,?,?,?)', [index, name, email, stationId, eduId, remote], (err, result) => res.json({ id: result.insertId }));
});
app.get('/api/my-profile', (req, res) => {
    const sql = `SELECT s.*, d.name as duty_station, e.level_name as education FROM staff s LEFT JOIN duty_stations d ON s.duty_station_id = d.id LEFT JOIN education_levels e ON s.education_id = e.id WHERE s.index_number = ?`;
    db.query(sql, [req.query.index], (err, results) => res.json(results[0] || {}));
});
app.put('/api/staff-update', (req, res) => {
    db.query('UPDATE staff SET email = ?, current_location = ? WHERE id = ?', [req.body.email, req.body.location, req.body.id], (err) => res.json({ message: "Updated" }));
});

// Training & Reports
app.get('/api/trainings', (req, res) => { db.query('SELECT * FROM trainings', (e, r) => res.json(r)); });

app.post('/api/trainings', (req, res) => {
    db.query('INSERT INTO trainings (course_name, description, duration_hours) VALUES (?,?,?)', [req.body.name, req.body.desc, req.body.hours], (e, r) => res.json({message:"Added"}));
});

app.post('/api/assign-training', (req, res) => {
    db.query('INSERT INTO staff_trainings (staff_id, training_id) VALUES (?, ?)', [req.body.staffId, req.body.trainingId], (e, r) => res.json({ message: "Assigned" }));
});

// NEW: Get Full History of Assignments
app.get('/api/all-assigned-trainings', (req, res) => {
    const sql = `SELECT st.id, s.full_names, s.index_number, t.course_name, st.assigned_date, st.status FROM staff_trainings st JOIN staff s ON st.staff_id = s.id JOIN trainings t ON st.training_id = t.id ORDER BY st.assigned_date DESC`;
    db.query(sql, (e, r) => res.json(r));
});

app.get('/api/my-trainings', (req, res) => {
    // Now selecting st.id as 'assignment_id' so we can update specific rows
    const sql = `SELECT st.id as assignment_id, t.course_name, t.description, st.status, st.assigned_date 
                 FROM staff_trainings st 
                 JOIN trainings t ON st.training_id = t.id 
                 WHERE st.staff_id = ?`;
    db.query(sql, [req.query.staffId], (e, r) => res.json(r));
});
// Update Training Status
app.put('/api/update-training-status', (req, res) => {
    const { id, status } = req.body;
    db.query('UPDATE staff_trainings SET status = ? WHERE id = ?', [status, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Status Updated" });
    });
});

app.get('/api/reports', (req, res) => {
    const sql = `SELECT (SELECT COUNT(*) FROM staff) as total_staff, (SELECT COUNT(*) FROM staff WHERE remote_available = 1) as remote_staff, (SELECT COUNT(*) FROM staff_trainings WHERE status = 'Completed') as completed_trainings`;
    db.query(sql, (e, r) => res.json(r[0]));
});

// Shifts
app.post('/api/apply-shift', (req, res) => {
    db.query('INSERT INTO shifts (staff_id, shift_date, shift_type) VALUES (?, ?, ?)', [req.body.staffId, req.body.date, req.body.type], (e, r) => res.json({ message: "Requested" }));
});

app.listen(PORT, () => console.log(`UNEP Portal Live on Port ${PORT}`));