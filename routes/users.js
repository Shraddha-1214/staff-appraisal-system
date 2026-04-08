const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth');

// Initialize Models
const Faculty = mongoose.model('users');
const Hod = mongoose.model('hod');
const Appraisal = mongoose.model('StaffAppraisal'); 

// --- LOGIN GET ROUTES ---
router.get('/faculty/login', (req, res) => res.render('users/faculty/login'));
router.get('/hod/login', (req, res) => res.render('users/hod/login'));

// --- FACULTY DASHBOARD ---
router.get('/faculty/facultyOverview', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id.toString();
        const currentYear = res.locals.year;
        const appraisal = await Appraisal.findOne({ facultyId: userId, academicYear: currentYear });

        const p1Done = !!(appraisal && appraisal.teachingProcess && appraisal.teachingProcess.length > 0);
        const p2Done = !!(appraisal && appraisal.studentFeedback && appraisal.studentFeedback.length > 0);
        
        res.render('users/faculty/facultyOverview', { 
            year: currentYear, 
            status: appraisal ? appraisal.status : 'Draft',
            p1Done,
            p2Done
        });
    } catch (err) {
        res.redirect('/');
    }
});

// --- HOD DASHBOARD ---
router.get('/hod/hodOverview', ensureAuthenticated, async (req, res) => {
    try {
        const currentYear = res.locals.year;
        const pendingCount = await Appraisal.countDocuments({ status: 'Submitted', academicYear: currentYear });
        res.render('users/hod/hodOverview', { year: currentYear, pendingCount: pendingCount });
    } catch (err) {
        res.redirect('/');
    }
});

// --- AUTHENTICATION POST ROUTES ---
// This handles: POST /users/faculty/login
router.post('/faculty/login', (req, res, next) => {
    passport.authenticate('faculty', {
        successRedirect: '/users/faculty/facultyOverview',
        failureRedirect: '/users/faculty/login',
        failureFlash: true
    })(req, res, next);
});

// This handles: POST /users/hod/login
router.post('/hod/login', (req, res, next) => {
    passport.authenticate('hod', {
        successRedirect: '/users/hod/hodOverview', 
        failureRedirect: '/users/hod/login',
        failureFlash: true
    })(req, res, next);
});

// --- REGISTRATION ---
router.post('/register', (req, res) => {
    const { name, email, department, password, confirm_password, type } = req.body;
    let errors = [];
    if (!name || !email || !department || !password) errors.push({ text: 'Please fill fields' });
    if (password !== confirm_password) errors.push({ text: 'Passwords mismatch' });

    if (errors.length > 0) {
        res.render('users/register', { errors, name, email, department });
    } else {
        const TargetModel = (type === 'hod') ? Hod : Faculty;
        TargetModel.findOne({ email }).then(user => {
            if (user) {
                req.flash('error_msg', 'Email exists');
                return res.redirect('/users/register');
            }
            const newUser = new TargetModel({ name, email, department, password, type: type || 'faculty' });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    newUser.password = hash;
                    newUser.save().then(() => {
                        req.flash('success_msg', 'Registered! Please login.');
                        res.redirect('/users/faculty/login');
                    });
                });
            });
        });
    }
});

// --- LOGOUT ---
router.get('/logout', (req, res) => {
    req.logout(() => {
        req.flash('success_msg', 'Logged out.');
        res.redirect('/');
    });
});

module.exports = router;