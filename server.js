require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// ==================== VIEW ENGINE SETUP ====================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==================== MIDDLEWARE SETUP ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== ROUTES SETUP ====================
const authRoutes = require('./router/authorize.router');
const blogRoutes = require('./router/blog.router');
app.use(authRoutes);
app.use(blogRoutes);

// ==================== ERROR HANDLING ====================
// Catch-all route for 404
app.use((req, res) => {
  res.redirect('/');
});

// ==================== SERVER START ====================
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});