const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appraisal = mongoose.model('StaffAppraisal');
const User = mongoose.model('users');
const { ensureAuthenticated } = require('../helpers/auth');

// HOD Middleware to check role
function ensureHOD(req, res, next) {
    if (req.user && req.user.role === 'hod') {
        return next();
    }
    req.flash('error_msg', 'Not Authorized. HOD access only.');
    res.redirect('/dashboard');
}

// GET: HOD Dashboard - List all faculty in their department
router.get('/dashboard', ensureAuthenticated, ensureHOD, async (req, res) => {
    try {
        // Find all appraisals in the HOD's department
        // Assuming your User model has a 'department' field
        const facultyAppraisals = await Appraisal.find({ academicYear: res.locals.year })
            .populate('facultyId')
            .lean();

        // Filter appraisals by the HOD's department
        const departmentReviews = facultyAppraisals.filter(app => 
            app.facultyId && app.facultyId.department === req.user.department
        );

        res.render('users/hod/dashboard', { departmentReviews });
    } catch (err) {
        res.render('users/hod/dashboard', { error_msg: 'Failed to load dashboard' });
    }
});

// GET: Review a specific faculty appraisal
router.get('/review/:id', ensureAuthenticated, ensureHOD, async (req, res) => {
    try {
        const appraisal = await Appraisal.findById(req.params.id).populate('facultyId').lean();
        res.render('users/hod/reviewForm', { appraisal });
    } catch (err) {
        res.redirect('/hod/dashboard');
    }
});

// POST: Save HOD Evaluation Marks
router.post('/save-evaluation/:id', ensureAuthenticated, ensureHOD, async (req, res) => {
    try {
        const marks = {
            teachingMarks: Number(req.body.teachingMarks),
            studentFeedbackMarks: Number(req.body.studentFeedbackMarks),
            deptActivityMarks: Number(req.body.deptActivityMarks),
            instActivityMarks: Number(req.body.instActivityMarks),
            societyMarks: Number(req.body.societyMarks),
            acrMarks: Number(req.body.acrMarks),
            overallRemarks: req.body.overallRemarks,
            reviewedAt: Date.now()
        };
        
        // Calculate Total
        marks.totalPart1 = marks.teachingMarks + marks.studentFeedbackMarks + 
                           marks.deptActivityMarks + marks.instActivityMarks + 
                           marks.societyMarks + marks.acrMarks;

        await Appraisal.findByIdAndUpdate(req.params.id, {
            $set: { hodEvaluations: marks, status: 'Reviewed' }
        });

        req.flash('success_msg', 'Appraisal Reviewed Successfully');
        res.redirect('/hod/dashboard');
    } catch (err) {
        req.flash('error_msg', 'Failed to save review');
        res.redirect('/hod/dashboard');
    }
});

module.exports = router;