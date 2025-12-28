const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db');
const { verifyToken } = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/register', (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run(`INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
        [username, hashedPassword, role],
        function (err) {
            if (err) return res.status(500).json({ error: 'User registration failed or username taken' });;
            const token = jwt.sign({ id: this.lastID, role }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.status(200).json({ auth: true, token, user: { id: this.lastID, username, role } });
        }
    );
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const passwordIsValid = bcrypt.compareSync(password, user.password_hash);
        if (!passwordIsValid) return res.status(401).json({ auth: false, token: null });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ auth: true, token, user: { id: user.id, username: user.username, role: user.role } });
    });
});

// Jobs Routes
app.get('/api/jobs', (req, res) => {
    db.all(`SELECT jobs.*, users.username as employer_name FROM jobs JOIN users ON jobs.employer_id = users.id`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error fetching jobs' });
        res.status(200).json(rows);
    });
});

app.post('/api/jobs', verifyToken, (req, res) => {
    if (req.userRole !== 'employer') return res.status(403).json({ error: 'Only employers can post jobs' });
    const { title, description } = req.body;
    db.run(`INSERT INTO jobs (employer_id, title, description) VALUES (?, ?, ?)`,
        [req.userId, title, description],
        function (err) {
            if (err) return res.status(500).json({ error: 'Error creating job' });
            res.status(200).json({ id: this.lastID, title, description, status: 'open' });
        }
    );
});

app.get('/api/jobs/:id/applications', verifyToken, (req, res) => {
    // Only fetch applications for a job if the requester is the employer who posted it
    const jobId = req.params.id;
    db.get(`SELECT employer_id FROM jobs WHERE id = ?`, [jobId], (err, job) => {
        if (err || !job) return res.status(404).json({ error: 'Job not found' });
        if (job.employer_id !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

        db.all(`SELECT applications.*, users.username as seeker_name FROM applications JOIN users ON applications.seeker_id = users.id WHERE job_id = ?`,
            [jobId],
            (err, rows) => {
                if (err) return res.status(500).json({ error: 'Error fetching applications' });
                res.status(200).json(rows);
            }
        );
    });
});

// Applications Routes
app.post('/api/applications', verifyToken, (req, res) => {
    if (req.userRole !== 'jobseeker') return res.status(403).json({ error: 'Only jobseekers can apply' });
    const { jobId, resumeText } = req.body;

    db.run(`INSERT INTO applications (job_id, seeker_id, resume_text) VALUES (?, ?, ?)`,
        [jobId, req.userId, resumeText],
        function (err) {
            if (err) return res.status(500).json({ error: 'Error submitting application' });
            res.status(200).json({ id: this.lastID, jobId, status: 'pending' });
        }
    );
});

app.get('/api/my-applications', verifyToken, (req, res) => {
    db.all(`SELECT applications.*, jobs.title as job_title, jobs.status as job_status FROM applications JOIN jobs ON applications.job_id = jobs.id WHERE seeker_id = ?`,
        [req.userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Error fetching applications' });
            res.status(200).json(rows);
        }
    );
});

app.put('/api/applications/:id/status', verifyToken, (req, res) => {
    if (req.userRole !== 'employer') return res.status(403).json({ error: 'Only employers can update status' });
    const { status } = req.body;
    const applicationId = req.params.id;

    // Verify ownership
    db.get(`SELECT jobs.employer_id FROM applications JOIN jobs ON applications.job_id = jobs.id WHERE applications.id = ?`,
        [applicationId],
        (err, result) => {
            if (err || !result) return res.status(404).json({ error: 'Application not found' });
            if (result.employer_id !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

            db.run(`UPDATE applications SET status = ? WHERE id = ?`, [status, applicationId], function (err) {
                if (err) return res.status(500).json({ error: 'Error updating status' });
                res.status(200).json({ success: true, status });
            });
        }
    );
});

// Profile Routes
app.get('/api/profile/:userId', verifyToken, (req, res) => {
    // Users can see their own profile or employers can see applicant profiles
    // For simplicity, we'll allow authenticated users to see any profile if they have the ID
    const targetId = req.params.userId === 'me' ? req.userId : req.params.userId;

    db.get(`SELECT * FROM profiles WHERE user_id = ?`, [targetId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Error fetching profile' });
        res.status(200).json(row || {}); // Return empty object if no profile yet
    });
});

app.post('/api/profile', verifyToken, (req, res) => {
    const { full_name, bio, skills, contact_email, phone } = req.body;

    // Upsert profile
    db.run(`INSERT INTO profiles (user_id, full_name, bio, skills, contact_email, phone) 
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
            full_name=excluded.full_name, bio=excluded.bio, skills=excluded.skills, 
            contact_email=excluded.contact_email, phone=excluded.phone`,
        [req.userId, full_name, bio, skills, contact_email, phone],
        function (err) {
            if (err) return res.status(500).json({ error: 'Error updating profile' });
            res.status(200).json({ success: true });
        }
    );
});

// Advanced Report Route
app.get('/api/employer/reports', verifyToken, (req, res) => {
    if (req.userRole !== 'employer') return res.status(403).json({ error: 'Unauthorized' });

    const query = `
        SELECT 
            j.title as job_title,
            u.username as applicant_username,
            p.full_name,
            p.skills,
            p.contact_email,
            a.status as application_status,
            a.created_at as applied_at
        FROM jobs j
        JOIN applications a ON j.id = a.job_id
        JOIN users u ON a.seeker_id = u.id
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE j.employer_id = ?
        ORDER BY j.title, a.created_at DESC
    `;

    db.all(query, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error fetching reports' });

        // Aggregate data for easier consumption if needed, or send flat
        res.status(200).json(rows);
    });
});

// Admin Routes
app.get('/api/admin/activity', verifyToken, (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Require Admin Role' });

    const query = `
        SELECT 
            a.id as application_id,
            u_seeker.username as seeker_name, 
            j.title as job_title, 
            u_employer.username as employer_name, 
            a.status as status,
            a.created_at
        FROM applications a
        JOIN users u_seeker ON a.seeker_id = u_seeker.id
        JOIN jobs j ON a.job_id = j.id
        JOIN users u_employer ON j.employer_id = u_employer.id
        ORDER BY a.created_at DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error fetching activity' });
        res.status(200).json(rows);
    });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
