const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth');

const Part3 = mongoose.model('part3');

// GET Route
router.get('/view/:year', ensureAuthenticated, async (req, res) => {
    try {
        const selectedYear = req.params.year;
        const existingData = await Part3.findOne({ 
            user: req.user.id, 
            academicYear: selectedYear 
        }).lean();

        res.render('parts/part3', {
            academicYear: selectedYear,
            savedInnovation: existingData ? existingData.innovationEntries : []
        });
    } catch (err) {
        res.redirect('/users/faculty/facultyOverview');
    }
});

// POST Route
router.post('/save', ensureAuthenticated, async (req, res) => {
    try {
        let { activity, organization, duration, points, enclosure, academicYear } = req.body;
        const toArr = (val) => Array.isArray(val) ? val : [val];

        const innovationData = toArr(activity).map((act, i) => ({
            activity: act,
            organization: toArr(organization)[i],
            duration: toArr(duration)[i],
            points: Number(toArr(points)[i]) || 0,
            enclosure: toArr(enclosure)[i]
        })).filter(item => item.activity && item.activity.trim() !== "");

        await Part3.findOneAndUpdate(
            { user: req.user.id, academicYear: academicYear },
            { user: req.user.id, academicYear: academicYear, innovationEntries: innovationData },
            { upsert: true, new: true }
        );

        req.flash('success_msg', 'Part 3 updated successfully!');
        res.redirect('/users/faculty/facultyOverview');
    } catch (err) {
        res.redirect('/users/faculty/facultyOverview');
    }
});

module.exports = router;