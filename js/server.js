const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Serve static files from the project root
app.use(express.static(path.join(__dirname, '..')));

const db = new sqlite3.Database(path.join(__dirname, '../DB/billing.db'));

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        gst TEXT,
        address TEXT,
        email TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId INTEGER,
        items TEXT,
        total REAL,
        totalTax REAL,
        finalAmount REAL,
        date TEXT,
        FOREIGN KEY(customerId) REFERENCES customers(id)
    )`);
    // Set starting value for customers and bills to 10001
    db.run(`UPDATE sqlite_sequence SET seq = 10000 WHERE name = 'customers'`);
    db.run(`UPDATE sqlite_sequence SET seq = 10000 WHERE name = 'bills'`);
});

// Create biller table if not exists
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS biller (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyName TEXT,
        gstNumber TEXT,
        hsnNumber TEXT,
        logo TEXT
    )`);
});

// Add customer
app.post('/api/customers', (req, res) => {
    const { name, phone, gst, address, email } = req.body;
    db.run(
        `INSERT INTO customers (name, phone, gst, address, email) VALUES (?, ?, ?, ?, ?)`,
        [name, phone, gst, address, email],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// Get customers
app.get('/api/customers', (req, res) => {
    db.all(`SELECT * FROM customers`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add bill
app.post('/api/bills', (req, res) => {
    const { customerId, items, total, totalTax, finalAmount, date } = req.body;
    db.run(
        `INSERT INTO bills (customerId, items, total, totalTax, finalAmount, date) VALUES (?, ?, ?, ?, ?, ?)`,
        [customerId, JSON.stringify(items), total, totalTax, finalAmount, date],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// Get bills
app.get('/api/bills', (req, res) => {
    db.all(`SELECT * FROM bills`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Delete customer
app.delete('/api/customers/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM customers WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Delete bill by ID
app.delete('/api/bills/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM bills WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Save biller details
app.post('/api/biller', (req, res) => {
    const { companyName, gstNumber, hsnNumber, logo } = req.body;
    // Only one biller record, so upsert (insert or update)
    db.get(`SELECT id FROM biller LIMIT 1`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            db.run(
                `UPDATE biller SET companyName=?, gstNumber=?, hsnNumber=?, logo=? WHERE id=?`,
                [companyName, gstNumber, hsnNumber, logo, row.id],
                function (err2) {
                    if (err2) return res.status(500).json({ error: err2.message });
                    res.json({ success: true, updated: true });
                }
            );
        } else {
            db.run(
                `INSERT INTO biller (companyName, gstNumber, hsnNumber, logo) VALUES (?, ?, ?, ?)`,
                [companyName, gstNumber, hsnNumber, logo],
                function (err2) {
                    if (err2) return res.status(500).json({ error: err2.message });
                    res.json({ success: true, inserted: true });
                }
            );
        }
    });
});

// Get biller details
app.get('/api/biller', (req, res) => {
    db.get(`SELECT * FROM biller LIMIT 1`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Webpage/index.html'));
});
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../Webpage/index.html'));
});
app.get('/customer.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../Webpage/customer.html'));
});
app.get('/bill.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../Webpage/bill.html'));
});
app.get('/biller.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../Webpage/biller.html'));
});
app.get('/navbar.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../Webpage/navbar.html'));
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
