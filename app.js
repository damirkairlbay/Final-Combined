require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const User = require('./models/user');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const bmiRoutes = require('./routes/bmi');
const emailRoutes = require('./routes/email');
const weatherRoutes = require('./routes/weather');
const blogRoutes = require('./routes/blogs');
const qrRoutes = require('./routes/qr');
const { isAuthenticated } = require('./middleware/auth');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Make user data available to all templates
app.use(async (req, res, next) => {
    res.locals.user = null;
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            res.locals.user = user;
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }
    next();
});

// Auth routes (unprotected)
app.use('/auth', authRoutes);

// Protected routes
app.use('/', isAuthenticated); // Protect all routes below this
app.use('/weather', weatherRoutes);
app.use('/users', require('./routes/users'));
app.use('/bmi', bmiRoutes);
app.use('/blogs', blogRoutes);
app.use('/email', emailRoutes);
app.use('/qr', qrRoutes);

// Home Route (protected)
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Combined Project - Home',
        user: res.locals.user
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});