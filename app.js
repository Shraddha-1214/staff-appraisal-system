const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
require('dotenv').config();
const { ensureAuthenticated } = require('./helpers/auth');

const app = express();

// 1. LOAD MODELS
require('./models/Appraisal'); 
require('./models/Users/Faculty');
require('./models/Users/Hod');
require('./models/Users/ManagerDB');

// 2. MIDDLEWARE
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

const hbsHelpers = require('./helpers/hbs');
app.engine('handlebars', exphbs({ helpers: hbsHelpers, defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport')(passport);
const db = require('./config/database');
mongoose.connect(db.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.log(err));

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// 3. ROUTES
const users = require('./routes/users');
const appraisal = require('./routes/appraisal');
const hod = require('./routes/hod');
app.use('/users', users);
app.use('/appraisal', appraisal);
app.use('/hod', hod);

app.get('/', (req, res) => res.render('index'));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));