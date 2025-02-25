const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', (req, res) => {
    res.render('qr', { 
        title: 'QR Code Generator',
        qrImage: null,
        error: null
    });
});

router.post('/generate', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.render('qr', {
                title: 'QR Code Generator',
                error: 'Please provide text or URL to generate QR code',
                qrImage: null
            });
        }

        const qrImage = await QRCode.toDataURL(text);
        res.render('qr', {
            title: 'QR Code Generator',
            qrImage,
            error: null
        });
    } catch (error) {
        res.render('qr', {
            title: 'QR Code Generator',
            error: 'Error generating QR code',
            qrImage: null
        });
    }
});

module.exports = router;
