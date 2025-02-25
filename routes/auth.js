const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

// Middleware to redirect authenticated users
const redirectIfAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.redirect('/');
    }
    next();
};

// Registration Route
router.get('/register', redirectIfAuthenticated, (req, res) => {
    res.render('register', { title: 'Register', error: null });
});

router.post('/register', redirectIfAuthenticated, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('register', {
                title: 'Register',
                error: 'Username already exists'
            });
        }

        // Create new user (password will be hashed by the pre-save middleware)
        const newUser = new User({ username, password });
        await newUser.save();
        
        // Log the user in after registration
        req.session.userId = newUser._id;
        
        // Redirect to home or stored URL
        const returnTo = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(returnTo);
    } catch (error) {
        res.render('register', {
            title: 'Register',
            error: 'Error registering new user'
        });
    }
});

// Login Route
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login', { title: 'Login', error: null });
});

router.post('/login', redirectIfAuthenticated, async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            
            // Redirect to stored URL or home
            const returnTo = req.session.returnTo || '/';
            delete req.session.returnTo;
            res.redirect(returnTo);
        } else {
            res.render('login', {
                title: 'Login',
                error: 'Invalid username or password'
            });
        }
    } catch (error) {
        res.render('login', {
            title: 'Login',
            error: 'Error logging in'
        });
    }
});

// Logout Route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;