const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('email');
});

router.post('/send', async (req, res) => {
    const { to, subject, text } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    let mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.render('email', { message: 'Email sent successfully!' });
    } catch (error) {
        res.status(500).send('Error sending email');
    }
});

module.exports = router;