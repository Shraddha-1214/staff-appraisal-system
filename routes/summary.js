const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth');

// Load Part Models
const Part1 = mongoose.model('part1');
const Part2 = mongoose.model('part2');
const Part3 = mongoose.model('part3');
const Part4 = mongoose.model('part4');

router.get('/view/:year', ensureAuthenticated, async (req, res) => {
    try {
        const year = req.params.year;
        const userId = req.user.id;

        // Fetch all parts simultaneously
        const [p1, p2, p3, p4] = await Promise.all([
            Part1.findOne({ user: userId, academicYear: year }).lean(),
            Part2.findOne({ user: userId, academicYear: year }).lean(),
            Part3.findOne({ user: userId, academicYear: year }).lean(),
            Part4.findOne({ user: userId, academicYear: year }).lean()
        ]);

        // Calculate Totals - Ensuring we handle null/missing data safely
        const totalP1 = p1 ? p1.courses.reduce((s, c) => s + (parseFloat(c.points) || 0), 0) : 0;
        const totalP2 = p2 ? p2.researchEntries.reduce((s, r) => s + (parseFloat(r.points) || 0), 0) : 0;
        const totalP3 = p3 ? p3.innovationEntries.reduce((s, i) => s + (parseFloat(i.points) || 0), 0) : 0;
        const totalP4 = p4 ? p4.adminEntries.reduce((s, a) => s + (parseFloat(a.points) || 0), 0) : 0;

        // MATCHING THE FILENAME: parts/summary.handlebars
        res.render('parts/summary', {
            year,
            totalP1: totalP1.toFixed(2),
            totalP2: totalP2.toFixed(2),
            totalP3: totalP3.toFixed(2),
            totalP4: totalP4.toFixed(2),
            grandTotal: (totalP1 + totalP2 + totalP3 + totalP4).toFixed(2)
        });
    } catch (err) {
        console.error("Summary Error:", err);
        res.redirect('/users/faculty/facultyOverview');
    }
});

module.exports = router;