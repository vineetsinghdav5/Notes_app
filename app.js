require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const connectDB = require('./server/config/db');
const session = require('express-session');
const passport = require('passport');
const Mongostore = require('connect-mongo');

const app = express();
const port = process.env.PORT || 3003;

// Trust proxy for secure cookies on Render
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: Mongostore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Connect to MongoDB
connectDB();

// Static files
app.use(express.static('public'));

// EJS templates
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Routes
app.use('/', require('./server/routes/auth'));
app.use('/', require('./server/routes/dashboard'));
app.use('/', require('./server/routes/index'));

// 404 page
app.get('*', (req, res) => {
  res.status(404).render('404');
});

// Start server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
