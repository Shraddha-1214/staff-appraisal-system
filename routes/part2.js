const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth');

const Part2 = mongoose.model('part2');

// GET Route: This fixes the "Cannot GET /part2/view/:year"
router.get('/view/:year', ensureAuthenticated, async (req, res) => {
    try {
        const selectedYear = req.params.year;
        const existingData = await Part2.findOne({ 
            user: req.user.id, 
            academicYear: selectedYear 
        }).lean();

        res.render('parts/part2', {
            academicYear: selectedYear,
            savedResearch: existingData ? existingData.researchEntries : []
        });
    } catch (err) {
        res.redirect('/users/faculty/facultyOverview');
    }
});

// POST Route: Save logic
router.post('/save', ensureAuthenticated, async (req, res) => {
    try {
        let { title, category, journal, impact, points, enclosure, academicYear } = req.body;
        const toArr = (val) => Array.isArray(val) ? val : [val];

        const researchData = toArr(title).map((t, i) => ({
            title: t,
            category: toArr(category)[i],
            journalName: toArr(journal)[i],
            impactFactor: Number(toArr(impact)[i]) || 0,
            points: Number(toArr(points)[i]) || 0,
            enclosure: toArr(enclosure)[i]
        })).filter(item => item.title && item.title.trim() !== "");

        await Part2.findOneAndUpdate(
            { user: req.user.id, academicYear: academicYear },
            { user: req.user.id, academicYear: academicYear, researchEntries: researchData },
            { upsert: true, new: true }
        );

        req.flash('success_msg', 'Part 2 updated!');
        res.redirect('/users/faculty/facultyOverview');
    } catch (err) {
        res.redirect('/users/faculty/facultyOverview');
    }
});

module.exports = router;