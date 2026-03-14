const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth');

const Part4 = mongoose.model('part4');

// GET Route
router.get('/view/:year', ensureAuthenticated, async (req, res) => {
    try {
        const selectedYear = req.params.year;
        const existingData = await Part4.findOne({ 
            user: req.user.id, 
            academicYear: selectedYear 
        }).lean();

        res.render('parts/part4', {
            academicYear: selectedYear,
            savedAdmin: existingData ? existingData.adminEntries : []
        });
    } catch (err) {
        res.redirect('/users/faculty/facultyOverview');
    }
});

// POST Route
router.post('/save', ensureAuthenticated, async (req, res) => {
    try {
        let { role, level, points, enclosure, academicYear } = req.body;
        const toArr = (val) => Array.isArray(val) ? val : [val];

        const adminData = toArr(role).map((r, i) => ({
            role: r,
            level: toArr(level)[i],
            points: Number(toArr(points)[i]) || 0,
            enclosure: toArr(enclosure)[i]
        })).filter(item => item.role && item.role.trim() !== "");

        await Part4.findOneAndUpdate(
            { user: req.user.id, academicYear: academicYear },
            { user: req.user.id, academicYear: academicYear, adminEntries: adminData },
            { upsert: true, new: true }
        );

        req.flash('success_msg', 'Part 4 saved successfully!');
        res.redirect('/users/faculty/facultyOverview');
    } catch (err) {
        res.redirect('/users/faculty/facultyOverview');
    }
});

module.exports = router;