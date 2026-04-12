const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appraisal = mongoose.model('StaffAppraisal');
const { ensureAuthenticated } = require('../helpers/auth');
const upload = require('../config/multer'); // Your multer config

// Generic Save Helper
async function saveSection(req, res, fieldName, dataArray, msg) {
    try {
        await Appraisal.findOneAndUpdate(
            { facultyId: req.user.id, academicYear: res.locals.year },
            { $set: { [fieldName]: dataArray, status: 'Draft' } },
            { upsert: true }
        );
        req.flash('success_msg', msg);
        res.redirect('/appraisal/form');
    } catch (err) {
        req.flash('error_msg', 'Save Failed');
        res.redirect('/appraisal/form');
    }
}

// GET: Render Form
router.get('/form', ensureAuthenticated, async (req, res) => {
    try {
        const appraisal = await Appraisal.findOne({ facultyId: req.user.id, academicYear: res.locals.year }).lean();
        res.render('users/faculty/fullAppraisal', { appraisal, year: res.locals.year });
    } catch (err) { res.redirect('/dashboard'); }
});

// PART I SAVES (5)
router.post('/save-teaching', (req, res) => saveSection(req, res, 'teachingProcess', Object.values(req.body.teachingProcess || {}), '1.1 Saved'));
router.post('/save-feedback', (req, res) => saveSection(req, res, 'studentFeedback', Object.values(req.body.studentFeedback || {}), '1.2 Saved'));
router.post('/save-dept', (req, res) => saveSection(req, res, 'deptActivities', Object.values(req.body.deptActivities || {}), '1.3 Saved'));
router.post('/save-inst', (req, res) => saveSection(req, res, 'instActivities', Object.values(req.body.instActivities || {}), '1.4 Saved'));
router.post('/save-society', (req, res) => saveSection(req, res, 'societyActivities', Object.values(req.body.societyActivities || {}), '1.5 Saved'));

// PART II SAVES (3)
router.post('/save-fdp', (req, res) => saveSection(req, res, 'fdpTrainings', Object.values(req.body.fdpTrainings || {}), '2.1 Saved'));
router.post('/save-mooc', (req, res) => saveSection(req, res, 'moocCourses', Object.values(req.body.moocCourses || {}), '2.2 Saved'));
router.post('/save-industrial', (req, res) => saveSection(req, res, 'industrialTrainings', Object.values(req.body.industrialTrainings || {}), '2.3 Saved'));

// PART III SAVES (7)
router.post('/save-publications', (req, res) => saveSection(req, res, 'researchPublications', Object.values(req.body.researchPublications || {}), '3.1 Saved'));
router.post('/save-other-pubs', (req, res) => saveSection(req, res, 'otherPublications', Object.values(req.body.otherPublications || {}), '3.2 Saved'));
router.post('/save-projects', (req, res) => saveSection(req, res, 'sponsoredProjects', Object.values(req.body.sponsoredProjects || {}), '3.3 Saved'));
router.post('/save-consultancy', (req, res) => saveSection(req, res, 'consultancyProjects', Object.values(req.body.consultancyProjects || {}), '3.4 Saved'));
router.post('/save-patents', (req, res) => saveSection(req, res, 'patents', Object.values(req.body.patents || {}), '3.5 Saved'));
router.post('/save-guidance', (req, res) => saveSection(req, res, 'researchGuidance', Object.values(req.body.researchGuidance || {}), '3.6 Saved'));
router.post('/save-awards', (req, res) => saveSection(req, res, 'awardsLectures', Object.values(req.body.awardsLectures || {}), '3.7 Saved'));

// PART IV SAVES (2)
router.post('/save-innovative', (req, res) => saveSection(req, res, 'innovativeTeaching', Object.values(req.body.innovativeTeaching || {}), '4.1 Saved'));
router.post('/save-e-learning', (req, res) => saveSection(req, res, 'elearningMaterial', Object.values(req.body.elearningMaterial || {}), '4.2 Saved'));

// PART V SAVE (1)
router.post('/save-other-info', (req, res) => saveSection(req, res, 'otherInfo', Object.values(req.body.otherInfo || {}), 'Part V Saved'));

// PART VI: BULK ENCLOSURE UPLOAD 
router.post('/save-enclosures', ensureAuthenticated, upload, (req, res) => {
    const descriptions = req.body.enclosureDescriptions || [];
    const enclosureNos = req.body.enclosureNos || [];
    const existingUrls = req.body.existingUrls || [];
    
    let fileIndex = 0;
    const data = descriptions.map((desc, i) => {
        let fileUrl = existingUrls[i] || '';
        // If a new file was uploaded for this slot
        if (req.files && req.files[fileIndex]) {
            fileUrl = '/uploads/' + req.files[fileIndex].filename;
            fileIndex++;
        }
        return { enclosureNo: enclosureNos[i], description: desc, fileUrl };
    });

    saveSection(req, res, 'generalEnclosures', data, 'All Documents Uploaded!');
});


// POST: Final Submit Appraisal
router.post('/final-submit', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const year = res.locals.year;

        // Update status to 'Submitted' [cite: 64]
        await Appraisal.findOneAndUpdate(
            { facultyId: userId, academicYear: year },
            { $set: { status: 'Submitted' } }
        );

        req.flash('success_msg', 'Appraisal submitted successfully to HOD!');
        res.redirect('/users/faculty/facultyOverview');
    } catch (err) {
        req.flash('error_msg', 'Submission failed. Please try again.');
        res.redirect('/appraisal/form');
    }
});

module.exports = router;