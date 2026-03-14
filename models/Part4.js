const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Part4Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    academicYear: { type: String, required: true },
    adminEntries: [{
        role: { type: String, required: true }, // e.g., Exam Coordinator, Lab In-charge
        level: { type: String }, // e.g., Department, Institute, University
        points: { type: Number, default: 0 },
        enclosure: { type: String }
    }],
    date: { type: Date, default: Date.now }
});

mongoose.model('part4', Part4Schema);