const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth');

// Load Model
const Part1 = mongoose.model('part1');

// routes/part1.js
router.get('/view/:year', ensureAuthenticated, async (req, res) => {
    try {
        const selectedYear = req.params.year;
        const existingData = await Part1.findOne({ 
            user: req.user.id, 
            academicYear: selectedYear 
        }).lean(); // <--- THIS .lean() IS REQUIRED

        res.render('parts/part1', {
            academicYear: selectedYear,
            savedCourses: existingData ? existingData.courses : [] 
        });
    } catch (err) {
        res.redirect('/users/faculty/facultyOverview');
    }
});
// POST Route
router.post('/save', ensureAuthenticated, async (req, res) => {
    try {
        // 1. Destructure 'academicYear' from req.body
        let { semester, course, type, scheduled, held, points, enclosure, academicYear } = req.body;
        
        const toArr = (val) => Array.isArray(val) ? val : [val];
        const courses = toArr(course);

        const teachingEntries = courses.map((cName, i) => ({
            semester: toArr(semester)[i] || "Sem-I",
            courseName: cName,
            type: toArr(type)[i] || "L",
            scheduled: Number(toArr(scheduled)[i]) || 0,
            actuallyHeld: Number(toArr(held)[i]) || 0,
            points: parseFloat(toArr(points)[i]) || 0,
            enclosure: toArr(enclosure)[i] || ""
        })).filter(entry => entry.courseName && entry.courseName.trim() !== "");

        // 2. CRITICAL: Use the academicYear variable from the form
        await Part1.findOneAndUpdate(
            { user: req.user.id, academicYear: academicYear }, 
            { 
                user: req.user.id,
                academicYear: academicYear, // Now it will save 2025-26
                courses: teachingEntries 
            },
            { upsert: true, new: true }
        );

        req.flash('success_msg', `Teaching Process for ${academicYear} updated successfully!`);
        res.redirect('/users/faculty/facultyOverview');

    } catch (err) {
        console.error("Save Error:", err);
        req.flash('error_msg', 'Failed to save data.');
        res.redirect('/users/faculty/facultyOverview');
    }
});

module.exports = router;