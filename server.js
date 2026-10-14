require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(__dirname, 'registrations.json');
const validInterests = new Set(['Social Media', 'SEO', 'Ads', 'Content', 'Other', 'General']);

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]');
}

app.post('/api/register', async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Please enter your details.' });
  }

  const { name, email, interest } = body;
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim() : '';
  const cleanInterest = typeof interest === 'string' ? interest : 'General';

  if (cleanName.length < 2 || cleanName.length > 100) {
    return res.status(400).json({ error: 'Please enter a name between 2 and 100 characters.' });
  }
  if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!validInterests.has(cleanInterest)) {
    return res.status(400).json({ error: 'Please select a valid service.' });
  }

  try {
    const registrations = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (!Array.isArray(registrations)) throw new Error('Invalid registration data');

    const registration = {
      id: require('crypto').randomUUID(),
      name: cleanName,
      email: cleanEmail,
      interest: cleanInterest,
      date: new Date().toISOString()
    };

    registrations.push(registration);
    fs.writeFileSync(DATA_FILE, JSON.stringify(registrations, null, 2));

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.ALERT_RECEIVER) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ALERT_RECEIVER,
        subject: 'New Ignitara website enquiry',
        text: [
          'A new enquiry came in through the website.',
          'Name: ' + cleanName,
          'Email: ' + cleanEmail,
          'Interest: ' + cleanInterest,
          'Date: ' + registration.date
        ].join('\n')
      }).catch(error => console.error('Email notification failed:', error.message));
    }

    return res.status(201).json({ message: 'Enquiry received.' });
  } catch (error) {
    console.error('Unable to save enquiry:', error);
    return res.status(500).json({ error: 'Unable to save your enquiry right now. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log('Ignitara running on http://localhost:' + PORT);
});
