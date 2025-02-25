const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { isAuthenticated } = require('../middleware/auth');

// Profile page
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        res.render('profile', { user, error: null, success: null });
    } catch (error) {
        res.status(500).render('error', { error: 'Server error' });
    }
});

// Update username
router.post('/update-username', isAuthenticated, async (req, res) => {
    try {
        const { newUsername } = req.body;
        
        // Check if username already exists
        const existingUser = await User.findOne({ username: newUsername });
        if (existingUser) {
            return res.render('profile', { 
                user: await User.findById(req.session.userId),
                error: 'Username already exists',
                success: null
            });
        }

        await User.findByIdAndUpdate(req.session.userId, { username: newUsername });
        
        res.render('profile', {
            user: await User.findById(req.session.userId),
            error: null,
            success: 'Username updated successfully'
        });
    } catch (error) {
        res.render('profile', {
            user: await User.findById(req.session.userId),
            error: 'Error updating username',
            success: null
        });
    }
});

// Update password
router.post('/update-password', isAuthenticated, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.session.userId);

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.render('profile', {
                user,
                error: 'Current password is incorrect',
                success: null
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update password
        await User.findByIdAndUpdate(req.session.userId, { password: hashedPassword });
        
        res.render('profile', {
            user,
            error: null,
            success: 'Password updated successfully'
        });
    } catch (error) {
        res.render('profile', {
            user: await User.findById(req.session.userId),
            error: 'Error updating password',
            success: null
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.redirect('/login');
    });
});

module.exports = router;
