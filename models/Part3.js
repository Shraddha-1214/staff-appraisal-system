const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Part3Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    academicYear: { type: String, required: true },
    innovationEntries: [{
        activity: { type: String, required: true }, // e.g., Consultancy, Patent, Guest Lecture
        organization: { type: String },
        duration: { type: String },
        points: { type: Number, default: 0 },
        enclosure: { type: String }
    }],
    date: { type: Date, default: Date.now }
});

mongoose.model('part3', Part3Schema);