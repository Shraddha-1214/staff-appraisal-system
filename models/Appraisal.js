const mongoose = require('mongoose');

const AppraisalSchema = new mongoose.Schema({
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    academicYear: { type: String, required: true },
    status: { type: String, default: 'Draft' }, // Draft, Submitted, Reviewed
    
    // Part I (5)
    teachingProcess: { type: mongoose.Schema.Types.Mixed, default: [] },
    studentFeedback: { type: mongoose.Schema.Types.Mixed, default: [] },
    deptActivities: { type: mongoose.Schema.Types.Mixed, default: [] },
    instActivities: { type: mongoose.Schema.Types.Mixed, default: [] },
    societyActivities: { type: mongoose.Schema.Types.Mixed, default: [] },

    // Part II (3)
    fdpTrainings: { type: mongoose.Schema.Types.Mixed, default: [] },
    moocCourses: { type: mongoose.Schema.Types.Mixed, default: [] },
    industrialTrainings: { type: mongoose.Schema.Types.Mixed, default: [] },

    // Part III (7)
    researchPublications: { type: mongoose.Schema.Types.Mixed, default: [] },
    otherPublications: { type: mongoose.Schema.Types.Mixed, default: [] },
    sponsoredProjects: { type: mongoose.Schema.Types.Mixed, default: [] },
    consultancyProjects: { type: mongoose.Schema.Types.Mixed, default: [] },
    patents: { type: mongoose.Schema.Types.Mixed, default: [] },
    researchGuidance: { type: mongoose.Schema.Types.Mixed, default: [] },
    awardsLectures: { type: mongoose.Schema.Types.Mixed, default: [] },

    // Part IV (2) & V (1)
    innovativeTeaching: { type: mongoose.Schema.Types.Mixed, default: [] },
    elearningMaterial: { type: mongoose.Schema.Types.Mixed, default: [] },
    otherInfo: { type: mongoose.Schema.Types.Mixed, default: [] },

    // Part VI
    generalEnclosures: { type: mongoose.Schema.Types.Mixed, default: [] },

    // HOD EVALUATION SECTION 
    hodEvaluations: {
        teachingMarks: { type: Number, default: 0 },   // Section 1.1
        studentFeedbackMarks: { type: Number, default: 0 }, // Section 1.2
        deptActivityMarks: { type: Number, default: 0 },    // Section 1.3
        instActivityMarks: { type: Number, default: 0 },    // Section 1.4
        societyMarks: { type: Number, default: 0 },         // Section 1.5
        acrMarks: { type: Number, default: 0 },             // Section 1.6
        totalPart1: { type: Number, default: 0 },           // Sum of 1.1 - 1.6
        overallRemarks: { type: String, default: '' },
        reviewedAt: { type: Date }
    }

}, { timestamps: true });

module.exports = mongoose.model('StaffAppraisal', AppraisalSchema);