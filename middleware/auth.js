const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    // Store the requested URL to redirect back after login
    req.session.returnTo = req.originalUrl;
    res.redirect('/auth/login');
};

module.exports = { isAuthenticated };
