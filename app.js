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

if (process.env.NODE_ENV === 'production') {
  // If behind a proxy (Render), enable trust proxy so secure cookies work
  app.set('trust proxy', 1);
}

app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat', // use env var in production
    resave: false,
    saveUninitialized: true,
    store: Mongostore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // send cookie only over https when in prod
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride("_method"));

//connect DB
connectDB();

// Static files
app.use(express.static('public'));

// Templating engine
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

//routes
app.use('/',require('./server/routes/auth'));
app.use('/',require('./server/routes/index'));
app.use('/', require('./server/routes/dashboard'));

//handle 404
app.get('*',function(req,res){
    res.status(404).render('404')
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
