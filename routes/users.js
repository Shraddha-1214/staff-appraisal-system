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

// --- REGISTRATION GET ROUTE (FIXES THE "CANNOT GET" ERROR) ---
router.get('/register', (req, res) => {
    res.render('users/register'); // Renders views/users/register.handlebars
});

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
        // The HOD will see appraisals submitted in their department
        const pendingCount = await Appraisal.countDocuments({ status: 'Submitted', academicYear: currentYear });
        res.render('users/hod/hodOverview', { year: currentYear, pendingCount: pendingCount });
    } catch (err) {
        res.redirect('/');
    }
});

// --- AUTHENTICATION POST ROUTES ---
router.post('/faculty/login', (req, res, next) => {
    passport.authenticate('faculty', {
        successRedirect: '/users/faculty/facultyOverview',
        failureRedirect: '/users/faculty/login',
        failureFlash: true
    })(req, res, next);
});

router.post('/hod/login', (req, res, next) => {
    passport.authenticate('hod', {
        successRedirect: '/users/hod/hodOverview', 
        failureRedirect: '/users/hod/login',
        failureFlash: true
    })(req, res, next);
});

// --- REGISTRATION POST ROUTE ---
router.post('/register', (req, res) => {
    const { name, email, department, password, confirm_password, type } = req.body;
    let errors = [];

    if (!name || !email || !department || !password) errors.push({ text: 'Please fill all fields' });
    if (password !== confirm_password) errors.push({ text: 'Passwords do not match' });
    if (password.length < 4) errors.push({ text: 'Password must be at least 4 characters' });

    if (errors.length > 0) {
        res.render('users/register', { errors, name, email, department, type });
    } else {
        // Choose model based on registration type (faculty or hod)
        const TargetModel = (type === 'hod') ? Hod : Faculty;

        TargetModel.findOne({ email: email }).then(user => {
            if (user) {
                req.flash('error_msg', 'Email already exists for this role');
                return res.redirect('/users/register');
            }

            const newUser = new TargetModel({ 
                name, 
                email, 
                department, 
                password, 
                type: type || 'faculty' 
            });

            // Hash Password
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save().then(() => {
                        req.flash('success_msg', `Successfully registered as ${type === 'hod' ? 'HOD' : 'Faculty'}. Please login.`);
                        // Redirect to the appropriate login page
                        res.redirect(type === 'hod' ? '/users/hod/login' : '/users/faculty/login');
                    }).catch(err => console.log(err));
                });
            });
        });
    }
});

// --- HOD APPRAISAL LIST (FIXES THE "CANNOT GET" ERROR) ---
router.get('/hod/appraisalList', ensureAuthenticated, async (req, res) => {
    try {
        const currentYear = res.locals.year;
        
        // Find all appraisals that have been 'Submitted' (ready for review)
        // We populate 'facultyId' to get the name and details of the faculty member
        const appraisals = await Appraisal.find({ 
            academicYear: currentYear,
            status: 'Submitted' 
        }).populate('facultyId').lean();

        // Optional: Filter by HOD's department if your models support it
        const departmentAppraisals = appraisals.filter(app => 
            app.facultyId && app.facultyId.department === req.user.department
        );

        res.render('users/hod/appraisalList', { 
            year: currentYear, 
            appraisals: departmentAppraisals 
        });
    } catch (err) {
        req.flash('error_msg', 'Failed to load appraisal list');
        res.redirect('/users/hod/hodOverview');
    }
});

// --- HOD REVIEW HELPER ---
function ensureHOD(req, res, next) {
    if (req.user && req.user.type === 'hod') {
        return next();
    }
    req.flash('error_msg', 'Access Denied. HOD Only.');
    res.redirect('/');
}

// GET: Review Profile Page (Read-Only Faculty Data)
router.get('/hod/review/:id', ensureAuthenticated, ensureHOD, async (req, res) => {
    try {
        const appraisal = await Appraisal.findById(req.params.id).populate('facultyId').lean();
        res.render('users/hod/reviewProfile', { appraisal });
    } catch (err) {
        res.redirect('/users/hod/appraisalList');
    }
});

// POST: Save HOD Final Marks 
router.post('/hod/save-evaluation/:id', ensureAuthenticated, ensureHOD, async (req, res) => {
    try {
        const marks = {
            teachingMarks: Number(req.body.teachingMarks) || 0,
            studentFeedbackMarks: Number(req.body.studentFeedbackMarks) || 0,
            deptActivityMarks: Number(req.body.deptActivityMarks) || 0,
            instActivityMarks: Number(req.body.instActivityMarks) || 0,
            societyMarks: Number(req.body.societyMarks) || 0,
            acrMarks: Number(req.body.acrMarks) || 0,
            overallRemarks: req.body.overallRemarks || ''
        };

        // Calculate Total for Part I [cite: 64]
        marks.totalPart1 = marks.teachingMarks + marks.studentFeedbackMarks + 
                           marks.deptActivityMarks + marks.instActivityMarks + 
                           marks.societyMarks + marks.acrMarks;

        await Appraisal.findByIdAndUpdate(req.params.id, {
            $set: { hodEvaluations: marks, status: 'Reviewed' }
        });

        req.flash('success_msg', 'Evaluation Finalized Successfully!');
        res.redirect('/users/hod/appraisalList');
    } catch (err) {
        req.flash('error_msg', 'Evaluation failed to save');
        res.redirect('/users/hod/appraisalList');
    }
});

// --- LOGOUT ---
router.get('/logout', (req, res) => {
    req.logout(() => {
        req.flash('success_msg', 'You are logged out.');
        res.redirect('/');
    });
});

module.exports = router;