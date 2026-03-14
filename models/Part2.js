const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Part2Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    academicYear: { type: String, required: true },
    // Array of research objects
    researchEntries: [{
        category: { type: String }, // e.g., Journal, Conference, Book
        title: { type: String, required: true },
        journalName: { type: String },
        impactFactor: { type: Number, default: 0 },
        points: { type: Number, default: 0 },
        enclosure: { type: String }
    }],
    date: { type: Date, default: Date.now }
});

mongoose.model('part2', Part2Schema);