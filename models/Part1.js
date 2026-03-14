const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Part1Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    academicYear: { type: String, default: '2024-25' },
    // Ensure this is an Array of Objects
    courses: [{
    semester: { type: String },
    courseName: { type: String },
    type: { type: String },
    scheduled: { type: Number },
    actuallyHeld: { type: Number },
    points: { type: Number },
    enclosure: { type: String }
}]
});

// Use 'part1' as the model name
module.exports = mongoose.model('part1', Part1Schema);