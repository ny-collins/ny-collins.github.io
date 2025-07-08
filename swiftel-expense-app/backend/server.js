const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD, // Loaded from .env
    database: 'swiftel_expenses'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ message: 'Unauthorized: No token provided' });

    jwt.verify(token, String(process.env.JWT_SECRET), (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden: Invalid token' });
        req.user = user;
        next();
    });
};

app.post('/api/register', async (req, res) => {
    const { username, password, email, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)', [username, hashedPassword, email, role], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Username or email already exists.' });
            }
            return res.status(500).json({ message: 'Error registering user', error: err.sqlMessage || err.message });
        }
        res.status(201).send('User registered');
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send('User not found');

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).send('Invalid password');

        const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
        res.json({ accessToken, role: user.role, id: user.id, username: user.username });
    });
});

app.post('/api/users/check-username', (req, res) => {
    const { username } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) {
            res.json({ isUnique: false });
        } else {
            res.json({ isUnique: true });
        }
    });
});

app.get('/api/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'Admin') return res.sendStatus(403);
    db.query('SELECT id, username, role FROM users', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.put('/api/users/:id/role', authenticateToken, (req, res) => {
    if (req.user.role !== 'Admin') return res.sendStatus(403);
    const { role } = req.body;
    db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send('User role updated');
    });
});

app.post('/api/requests', authenticateToken, (req, res) => {
    const { description, amount } = req.body;
    db.query('INSERT INTO requests (userId, description, amount) VALUES (?, ?, ?)', [req.user.id, description, amount], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).send('Request created');
    });
});

app.get('/api/dashboard/summary', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    let queryTotal = 'SELECT COUNT(*) AS total FROM requests';
    let queryPending = 'SELECT COUNT(*) AS pending FROM requests WHERE status = \'PENDING\'';
    let queryApproved = 'SELECT COUNT(*) AS approved FROM requests WHERE status = \'APPROVED\'';

    const queryParams = [];

    if (role === 'Employee') {
        queryTotal += ' WHERE userId = ?';
        queryPending += ' AND userId = ?';
        queryApproved += ' AND userId = ?';
        queryParams.push(userId, userId, userId);
    }

    db.query(queryTotal, [queryParams[0]], (err, totalResult) => {
        if (err) return res.status(500).send(err);
        db.query(queryPending, [queryParams[1]], (err, pendingResult) => {
            if (err) return res.status(500).send(err);
            db.query(queryApproved, [queryParams[2]], (err, approvedResult) => {
                if (err) return res.status(500).send(err);
                res.json({
                    total: totalResult[0].total,
                    pending: pendingResult[0].pending,
                    approved: approvedResult[0].approved
                });
            });
        });
    });
});

app.get('/api/dashboard/recent-requests', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    let query = 'SELECT r.description, r.amount, r.status, u.username FROM requests r JOIN users u ON r.userId = u.id';
    const queryParams = [];

    if (role === 'Employee') {
        query += ' WHERE r.userId = ?';
        queryParams.push(userId);
    }

    query += ' ORDER BY r.createdAt DESC LIMIT 5';

    db.query(query, queryParams, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.get('/api/requests', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    let query;
    let queryParams = [];

    if (role === 'Admin' || role === 'Employer') {
        query = `
            SELECT
                r.id, r.description, r.amount, r.status,
                u.username AS requestorUsername,
                                GROUP_CONCAT(JSON_OBJECT(
                    'employerId', ra.employerId,
                    'employerUsername', eu.username,
                    'status', ra.status
                ) SEPARATOR '###JSON_SEPARATOR###') AS decisions
            FROM requests r
            JOIN users u ON r.userId = u.id
            LEFT JOIN request_approvals ra ON r.id = ra.requestId
            LEFT JOIN users eu ON ra.employerId = eu.id
            GROUP BY r.id
            ORDER BY r.createdAt DESC
        `;
    } else { // Employee
        query = `
            SELECT
                r.id, r.description, r.amount, r.status,
                u.username AS requestorUsername
            FROM requests r
            JOIN users u ON r.userId = u.id
            WHERE r.userId = ?
            ORDER BY r.createdAt DESC
        `;
        queryParams.push(userId);
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching requests:', err);
            return res.status(500).json({ message: 'Error fetching requests', error: err.sqlMessage || err.message });
        }

        res.json(results);
    });
});

app.put('/api/requests/:id/status', authenticateToken, (req, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Employer') return res.sendStatus(403);
    const { status } = req.body;
    db.query('UPDATE requests SET status = ? WHERE id = ?', [status, req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send('Request status updated');
    });
});

app.delete('/api/requests/:id', authenticateToken, (req, res) => {
    if (req.user.role === 'Admin') {
        db.query('DELETE FROM requests WHERE id = ?', [req.params.id], (err, result) => {
            if (err) return res.status(500).send(err);
            res.send('Request deleted');
        });
    } else {
        db.query('DELETE FROM requests WHERE id = ? AND userId = ?', [req.params.id, req.user.id], (err, result) => {
            if (err) return res.status(500).send(err);
            if (result.affectedRows === 0) return res.status(404).send('Request not found or you do not have permission to delete it');
            res.send('Request deleted');
        });
    }
});

app.delete('/api/users/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden: Only Admin can delete users' });

    const userIdToDelete = req.params.id;

    db.query('DELETE FROM users WHERE id = ?', [userIdToDelete], (err, result) => {
        if (err) {
            // ER_ROW_IS_REFERENCED_2 is the MySQL error code for foreign key constraint violation
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ message: 'Cannot delete user: outstanding expense requests exist.' });
            }
            console.error('Error deleting user:', err);
            return res.status(500).json({ message: 'Error deleting user', error: err.sqlMessage || err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User deleted successfully.' });
    });
});

// Helper function to recalculate overall request status
async function recalculateRequestStatus(requestId) {
    return new Promise((resolve, reject) => {
        // Get total number of Employers
        db.query('SELECT COUNT(*) AS totalEmployers FROM users WHERE role = ?', ['Employer'], (err, employerCountResult) => {
            if (err) return reject(err);
            const totalEmployers = employerCountResult[0].totalEmployers;

            // Get all decisions for this request
            db.query('SELECT status FROM request_approvals WHERE requestId = ?', [requestId], (err, decisions) => {
                if (err) return reject(err);

                let approvedCount = 0;
                let disapprovedCount = 0;

                decisions.forEach(decision => {
                    if (decision.status === 'APPROVED') {
                        approvedCount++;
                    } else if (decision.status === 'DISAPPROVED') {
                        disapprovedCount++;
                    }
                });

                let newOverallStatus = 'PENDING';
                if (approvedCount === totalEmployers) {
                    newOverallStatus = 'APPROVED';
                } else if (disapprovedCount === totalEmployers) {
                    newOverallStatus = 'DISAPPROVED';
                }

                // Update the overall request status
                db.query('UPDATE requests SET status = ? WHERE id = ?', [newOverallStatus, requestId], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        });
    });
}

app.put('/api/requests/:id/decision', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Employer') {
        return res.status(403).json({ message: 'Forbidden: Only Employers can make decisions' });
    }

    const requestId = req.params.id;
    const employerId = req.user.id;
    const { status } = req.body; // Expected: 'APPROVED' or 'DISAPPROVED'

    if (!['APPROVED', 'DISAPPROVED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid decision status.' });
    }

    try {
        // Check if a decision already exists for this employer and request
        const [existingDecision] = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM request_approvals WHERE requestId = ? AND employerId = ?', [requestId, employerId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (existingDecision) {
            // Update existing decision
            await new Promise((resolve, reject) => {
                db.query('UPDATE request_approvals SET status = ?, updatedAt = NOW() WHERE id = ?', [status, existingDecision.id], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        } else {
            // Insert new decision
            await new Promise((resolve, reject) => {
                db.query('INSERT INTO request_approvals (requestId, employerId, status) VALUES (?, ?, ?)', [requestId, employerId, status], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        }

        // Recalculate overall request status
        await recalculateRequestStatus(requestId);

        res.status(200).json({ message: 'Decision recorded successfully.' });

    } catch (error) {
        console.error('Error recording decision:', error);
        res.status(500).json({ message: 'Error recording decision', error: error.message });
    }
});

// Password Reset Endpoints

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length === 0) return res.status(404).json({ message: 'No user with that email found' });

        const user = results[0];
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        db.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [token, expires, user.id], (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error' });

            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: 'Password Reset',
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                      `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                      `http://localhost:3000/reset-password.html?token=${token}\n\n` +
                      `If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };

            transporter.sendMail(mailOptions, (err, response) => {
                if (err) {
                    console.error('Error sending email:', err);
                    return res.status(500).json({ message: 'Error sending email' });
                }
                res.status(200).json({ message: 'Password reset email sent' });
            });
        });
    });
});

app.post('/api/reset-password', async (req, res) => {
    const { token, password } = req.body;
    db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length === 0) return res.status(400).json({ message: 'Password reset token is invalid or has expired' });

        const user = results[0];
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashedPassword, user.id], (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.status(200).json({ message: 'Password has been updated' });
        });
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
