const mongoose = require('mongoose');

const AppraisalSchema = new mongoose.Schema({
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    academicYear: { type: String, required: true },
    status: { type: String, default: 'Draft' },
    
    // Part I: AICTE 360 Feedback (5 sub-parts) [cite: 7-17]
    teachingProcess: { type: mongoose.Schema.Types.Mixed, default: [] },    // 1.1
    studentFeedback: { type: mongoose.Schema.Types.Mixed, default: [] },    // 1.2
    deptActivities: { type: mongoose.Schema.Types.Mixed, default: [] },     // 1.3
    instActivities: { type: mongoose.Schema.Types.Mixed, default: [] },     // 1.4
    societyActivities: { type: mongoose.Schema.Types.Mixed, default: [] },  // 1.5

    // Part II: Trainings (3 sub-parts) [cite: 22-28]
    fdpTrainings: { type: mongoose.Schema.Types.Mixed, default: [] },       // 2.1
    moocCourses: { type: mongoose.Schema.Types.Mixed, default: [] },        // 2.2
    industrialTrainings: { type: mongoose.Schema.Types.Mixed, default: [] }, // 2.3

    // Part III: Research (7 sub-parts) [cite: 29-49]
    researchPublications: { type: mongoose.Schema.Types.Mixed, default: [] }, // 3.1
    otherPublications: { type: mongoose.Schema.Types.Mixed, default: [] },    // 3.2
    sponsoredProjects: { type: mongoose.Schema.Types.Mixed, default: [] },    // 3.3
    consultancyProjects: { type: mongoose.Schema.Types.Mixed, default: [] },  // 3.4
    patents: { type: mongoose.Schema.Types.Mixed, default: [] },              // 3.5
    researchGuidance: { type: mongoose.Schema.Types.Mixed, default: [] },     // 3.6
    awardsLectures: { type: mongoose.Schema.Types.Mixed, default: [] },      // 3.7

    // Part IV: Innovative Teaching (2 sub-parts) [cite: 50-54]
    innovativeTeaching: { type: mongoose.Schema.Types.Mixed, default: [] },  // 4.1
    elearningMaterial: { type: mongoose.Schema.Types.Mixed, default: [] },   // 4.2

    // Part V: Other Information (1 sub-part) [cite: 55-57]
    otherInfo: { type: mongoose.Schema.Types.Mixed, default: [] },           // 5.1

    // Part VI: Centralized Enclosures (The Fix) 
    generalEnclosures: { type: mongoose.Schema.Types.Mixed, default: [] } 

}, { timestamps: true });

module.exports = mongoose.model('StaffAppraisal', AppraisalSchema);