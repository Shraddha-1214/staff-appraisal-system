const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HodSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    department: { type: String, required: true },
    type: { type: String, default: 'hod' },
    date: { type: Date, default: Date.now }
});

// Forces the collection name to be 'hod' (singular)
mongoose.model('hod', HodSchema, 'hod');