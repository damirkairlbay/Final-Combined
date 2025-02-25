const express = require('express');
const Blog = require('../models/blog');
const router = express.Router();

router.get('/', async (req, res) => {
    const blogs = await Blog.find();
    res.render('blogs', { blogs });
});

router.post('/create', async (req, res) => {
    const { title, body, author } = req.body;
    const newBlog = new Blog({ title, body, author });
    await newBlog.save();
    res.redirect('/blogs');
});

router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    res.render('blog', { blog });
});

router.post('/update/:id', async (req, res) => {
    const { title, body, author } = req.body;
    await Blog.findByIdAndUpdate(req.params.id, { title, body, author });
    res.redirect('/blogs');
});

router.post('/delete/:id', async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect('/blogs');
});

module.exports = router;