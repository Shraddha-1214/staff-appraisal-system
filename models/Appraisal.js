const mongoose = require('mongoose');

const TeachingProcessSchema = new mongoose.Schema({
  semester: String, // e.g., Sem-I 
  courseName: String, // e.g., System Programming 
  type: String, // T/L/P 
  scheduledClasses: Number, // 
  heldClasses: Number, // 
  pointsEarned: Number // This will be calculated 
});

// Inside models/Appraisal.js
const AppraisalSchema = new mongoose.Schema({
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teachingProcess: [{
        semester: String,
        courseName: String,
        scheduledClasses: Number, // Matches WIT Form
        heldClasses: Number,      // Matches WIT Form
        pointsEarned: Number      // Calculated automatically
    }]
});

module.exports = mongoose.model('Appraisal', AppraisalSchema);