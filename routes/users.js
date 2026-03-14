const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth');

// Initialize Models correctly
require('../models/Users/Faculty');
const Faculty = mongoose.model('users');
require('../models/Users/Hod');
const Hod = mongoose.model('hod');
require('../models/Users/FacultyProfile');
const FacultyProfile = mongoose.model('faculty_profile');

// Load AcademicYear Schema
const AcademicYear = mongoose.model('academic_year');

// Load Part Models for status checking
const Part1 = mongoose.model('part1');
const Part2 = mongoose.model('part2');
const Part3 = mongoose.model('part3');
const Part4 = mongoose.model('part4');

// --- REGISTRATION GET ROUTES ---
router.get('/register', (req, res) => {
    res.render('users/register');
});

router.get('/hod/registerFaculty', ensureAuthenticated, (req, res) => {
    res.render('users/register', { 
        title: 'Register New Faculty'
    });
});

// --- LOGIN GET ROUTES ---
router.get('/faculty/login', (req, res) => res.render('users/faculty/login'));
router.get('/hod/login', (req, res) => res.render('users/hod/login'));
router.get('/management/login', (req, res) => res.render('users/management/login'));

// --- FACULTY DASHBOARD (Updated with Status Checks) ---
router.get('/faculty/facultyOverview', ensureAuthenticated, async (req, res) => {
    try {
        const profile = await FacultyProfile.findOne({ user: req.user.id });
        if (!profile) {
            req.flash('error_msg', 'Please complete your profile details first.');
            return res.redirect('/profile/faculty/addProfile');
        }

        const result = await AcademicYear.findOne({ user: req.user.id }).sort({ date: -1 });
        if (!result) {
            req.flash('error_msg', 'Please initialize an Academic Year first');
            return res.redirect('/');
        }

        const currentYear = result.academic_year;

        // CHECK COMPLETION STATUS FOR PARTS
        const p1Data = await Part1.findOne({ user: req.user.id, academicYear: currentYear });
        const p2Data = await Part2.findOne({ user: req.user.id, academicYear: currentYear });

        // Logic: Mark as done if the document exists and has at least one entry
        const p1Done = p1Data && p1Data.courses && p1Data.courses.length > 0;
        const p2Done = p2Data && p2Data.researchEntries && p2Data.researchEntries.length > 0;

        // Can Submit only if Parts 1 and 2 are done (add 3 and 4 as you build them)
        const canSubmit = p1Done && p2Done && p3Done && p4Done;

        // Inside facultyOverview route:
        const Part3 = mongoose.model('part3');
        const p3Data = await Part3.findOne({ user: req.user.id, academicYear: currentYear });
        const p3Done = p3Data && p3Data.innovationEntries && p3Data.innovationEntries.length > 0;

        
        const p4Data = await Part4.findOne({ user: req.user.id, academicYear: currentYear });


        const p4Done = p4Data && p4Data.adminEntries.length > 0;

        

// Pass p3Done: p3Done to res.render

        res.render('users/faculty/facultyOverview', { 
            year: currentYear, 
            status: result.status,
            profile: profile,
            p1Done: p1Done,
            p2Done: p2Done,
            canSubmit: canSubmit
        });
    } catch (err) {
        console.error("Dashboard Error:", err);
        res.redirect('/');
    }
});

router.get('/hod/hodOverview', ensureAuthenticated, async (req, res) => {
    try {
        // 1. Get HOD's own appraisal status
        const result = await AcademicYear.findOne({ user: req.user.id }).sort({ date: -1 });
        
        // 2. Count pending faculty appraisals in their department for a notification badge
        const pendingCount = await AcademicYear.find({ 
            status: 'Submitted', // Or whatever status means "Waiting for HOD"
            // You might need to filter by department here if your schema supports it
        }).countDocuments();

        res.render('users/hod/hodOverview', {
            year: result ? result.academic_year : '2025-26',
            status: result ? result.status : 'Draft',
            pendingCount: pendingCount
        });
    } catch (err) {
        res.redirect('/');
    }
});

// GET: HOD's view of all faculty appraisals in their department
router.get('/hod/appraisalList', ensureAuthenticated, async (req, res) => {
    try {
        // 1. Find all faculty members in this HOD's department
        const facultyInDept = await Faculty.find({ department: req.user.department });
        
        // 2. Get the IDs of those faculty members
        const facultyIds = facultyInDept.map(f => f._id.toString());

        // 3. Find all appraisal records (AcademicYear) for these IDs
        // .populate('user') allows us to display their names in the table
        const appraisals = await AcademicYear.find({ 
            user: { $in: facultyIds } 
        }).populate('user').sort({ date: -1 }).lean();

        res.render('users/hod/appraisalList', {
            appraisals: appraisals,
            dept: req.user.department
        });
    } catch (err) {
        console.error("HOD List Error:", err);
        res.redirect('/users/hod/hodOverview');
    }
});

// GET: Management Home
router.get('/management/home', ensureAuthenticated, async (req, res) => {
    const totalFaculty = await Faculty.countDocuments();
    const totalHods = await Hod.countDocuments();
    const approvedCount = await AcademicYear.countDocuments({ status: 'Approved by HOD' });

    res.render('users/management/home', {
        totalFaculty,
        totalHods,
        approvedCount
    });
});

// GET: View All Users
router.get('/management/viewUsers', ensureAuthenticated, async (req, res) => {
    // Combine both faculty and HODs into one list for the admin
    const faculty = await Faculty.find({}).lean();
    const hods = await Hod.find({}).lean();
    
    res.render('users/management/viewUsers', {
        usersList: [...faculty, ...hods]
    });
});

// --- AUTHENTICATION POST ---
router.post('/faculty/login', (req, res, next) => {
    passport.authenticate('faculty', {
        successRedirect: '/users/faculty/facultyOverview',
        failureRedirect: '/users/faculty/login',
        failureFlash: true
    })(req, res, next);
});

// --- REGISTRATION POST ---
router.post('/register', (req, res) => {
    const { name, email, department, password, confirm_password, type } = req.body;
    let errors = [];

    if (!name || !email || !department || !password) {
        errors.push({ text: 'Please fill in all fields' });
    }
    if (password !== confirm_password) {
        errors.push({ text: 'Passwords do not match' });
    }
    if (password.length < 4) {
        errors.push({ text: 'Password must be at least 4 characters' });
    }

    if (errors.length > 0) {
        res.render('users/register', {
            errors, name, email, department, password, confirm_password
        });
    } else {
        const TargetModel = (type === 'hod') ? Hod : Faculty;

        TargetModel.findOne({ email: email })
            .then(user => {
                if (user) {
                    req.flash('error_msg', 'Email already registered');
                    return res.redirect('/users/register');
                }

                const newUser = new TargetModel({
                    name,
                    email,
                    department,
                    password,
                    type: type || 'faculty'
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'Registration successful! You can now log in.');
                                res.redirect('/users/faculty/login');
                            })
                            .catch(err => {
                                console.error("SAVE ERROR:", err);
                                res.redirect('/users/register');
                            });
                    });
                });
            })
            .catch(err => {
                console.error("DB ERROR:", err);
                res.redirect('/users/register');
            });
    }
});

router.get('/logout', (req, res) => {
    req.logout(() => {
        req.flash('success_msg', 'You are logged out');
        res.redirect('/');
    });
});

// --- HOD LOGIN POST ---
router.post('/hod/login', (req, res, next) => {
    passport.authenticate('hod', {
        // Change from /appraisalList to /hodOverview
        successRedirect: '/users/hod/hodOverview', 
        failureRedirect: '/users/hod/login',
        failureFlash: true
    })(req, res, next);
});

router.post('/management/login', (req, res, next) => {
    passport.authenticate('management_user', {
        successRedirect: '/users/management/home', // Points to your home.handlebars
        failureRedirect: '/users/management/login',
        failureFlash: true
    })(req, res, next);
});

// --- HOD APPROVAL ACTION ---
router.post('/hod/approve/:id', ensureAuthenticated, async (req, res) => {
    try {
        const { status, hod_remarks } = req.body;
        const facultyId = req.params.id;

        await AcademicYear.findOneAndUpdate(
            { user: facultyId }, 
            { 
                status: status === 'approved' ? 'Approved by HOD' : 'Returned for Correction',
                hod_remarks: hod_remarks,
                approval_date: new Date()
            }
        );

        const message = status === 'approved' ? 'Appraisal approved successfully!' : 'Appraisal returned to faculty.';
        req.flash('success_msg', message);
        res.redirect('/users/hod/appraisalList');
    } catch (err) {
        console.error("Approval Error:", err);
        req.flash('error_msg', 'Something went wrong during approval.');
        res.redirect('/users/hod/appraisalList');
    }
});

module.exports = router;