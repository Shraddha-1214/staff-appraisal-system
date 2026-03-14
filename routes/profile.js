const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth');

// Load User and Profile Models
require('../models/Users/FacultyProfile');
const FacultyProfile = mongoose.model('faculty_profile');
require('../models/Users/HodProfile');
const HodProfile = mongoose.model('hod_profile');

// Load Academic Year model for History
require('../models/AcademicYear');
const AcademicYear = mongoose.model('academic_year');

// --- FACULTY PROFILE & HISTORY ---
router.get('/faculty/index', ensureAuthenticated, async (req, res) => {
    try {
        const faculty_profile = await FacultyProfile.find({ user: req.user.id });
        // Fetch all appraisal years for history, sorted by newest first
        const history = await AcademicYear.find({ user: req.user.id }).sort({ academic_year: -1 });
        
        res.render('profile/faculty/index', {
            faculty_profile: faculty_profile,
            history: history // This array will contain 2024-25, 2025-26, etc.
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

// --- HOD PROFILE & HISTORY ---
router.get('/hod/index', ensureAuthenticated, async (req, res) => {
    try {
        const hod_profile = await HodProfile.find({ user: req.user.id });
        const history = await AcademicYear.find({ user: req.user.id }).sort({ academic_year: -1 });
        
        res.render('profile/hod/index', {
            hod_profile: hod_profile,
            history: history
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

// --- ADD / EDIT PROFILE ROUTES ---
router.get('/faculty/addProfile', ensureAuthenticated, (req, res) => res.render('profile/faculty/addProfile'));
router.get('/hod/addProfile', ensureAuthenticated, (req, res) => res.render('profile/hod/addProfile'));

router.get('/faculty/edit/:id', ensureAuthenticated, (req, res) => {
    FacultyProfile.findOne({ _id: req.params.id }).then(faculty_profile => {
        if (faculty_profile.user != req.user.id) {
            req.flash('error_msg', 'Not Authorized');
            res.redirect('/profile/faculty/index');
        } else {
            res.render('profile/faculty/edit', { faculty_profile });
        }
    });
});

// --- POST/PUT PROCESSORS ---
router.post('/faculty', ensureAuthenticated, (req, res) => {
    const FacultyProfileRecord = {
        faculty_name: req.body.faculty_name,
        designation: req.body.designation,
        department: req.body.department,
        qualification: req.body.qualification,
        teaching_exp: req.body.teaching_exp,
        appointment: req.body.appointment,
        date_of_join: req.body.date_of_join,
        DOB: req.body.DOB,
        salary: req.body.salary,
        user: req.user.id
    }
    new FacultyProfile(FacultyProfileRecord).save().then(() => {
        req.flash('success_msg', 'Profile added successfully');
        res.redirect('/profile/faculty/index');
    });
});


// POST Route to save Faculty Profile
router.post('/profile/faculty', ensureAuthenticated, async (req, res) => {
    try {
        const { 
            faculty_name, 
            department, 
            designation, 
            grade_pay, 
            last_promotion, 
            qualification, 
            teaching_exp, 
            salary, 
            date_of_join, 
            appointment, 
            DOB 
        } = req.body;

        // Check if profile already exists to update it, otherwise create new
        let profile = await FacultyProfile.findOne({ user: req.user.id });

        if (profile) {
            // Update existing profile
            profile.faculty_name = faculty_name;
            profile.department = department;
            profile.designation = designation;
            profile.grade_pay = grade_pay;
            profile.last_promotion = last_promotion;
            profile.qualification = qualification;
            profile.teaching_exp = teaching_exp;
            profile.salary = salary;
            profile.date_of_join = date_of_join;
            profile.appointment = appointment;
            profile.DOB = DOB;
        } else {
            // Create new profile
            profile = new FacultyProfile({
                user: req.user.id,
                faculty_name,
                department,
                designation,
                grade_pay,
                last_promotion,
                qualification,
                teaching_exp,
                salary,
                date_of_join,
                appointment,
                DOB
            });
        }

        await profile.save();
        req.flash('success_msg', 'Profile updated successfully!');
        res.redirect('/users/faculty/facultyOverview');
    } catch (err) {
        console.error("Profile Save Error:", err);
        req.flash('error_msg', 'Error saving profile. Please try again.');
        res.redirect('/profile/faculty/addProfile');
    }
});
router.put('/faculty/:id', ensureAuthenticated, (req, res) => {
    FacultyProfile.findOne({ _id: req.params.id }).then(profile => {
        profile.faculty_name = req.body.faculty_name;
        profile.designation = req.body.designation;
        profile.department = req.body.department;
        profile.qualification = req.body.qualification;
        profile.teaching_exp = req.body.teaching_exp;
        profile.appointment = req.body.appointment;
        profile.date_of_join = req.body.date_of_join;
        profile.DOB = req.body.DOB;
        profile.salary = req.body.salary;

        profile.save().then(() => {
            req.flash('success_msg', 'Profile updated');
            res.redirect('/profile/faculty/index');
        });
    });
});

module.exports = router;