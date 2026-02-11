require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Data storage (simple JSON file)
const DATA_FILE = path.join(__dirname, 'registrations.json');

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Nodemailer config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes
app.post('/api/register', async (req, res) => {
    const { name, email, interest } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and Email are required' });
    }

    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        const newRegistration = {
            id: Date.now(),
            name,
            email,
            interest: interest || 'General',
            date: new Date().toISOString()
        };

        data.push(newRegistration);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

        console.log(`New registration: ${name} (${email})`);

        // Send email alert
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.ALERT_RECEIVER || 'sarthakpawar9308@gmail.com',
                subject: `New Lead: ${name} - Ignitara Website`,
                text: `You have a new lead from the website!\n\nName: ${name}\nEmail: ${email}\nInterest: ${interest}\nDate: ${newRegistration.date}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        } else {
            console.log('Email credentials not found in .env, skipping email alert.');
        }

        res.status(201).json({ message: 'Registration successful!', user: newRegistration });
    } catch (error) {
        console.error('Error saving registration:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
