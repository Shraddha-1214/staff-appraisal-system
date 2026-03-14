const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FacultySchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    department: { type: String, required: true },
    type: { type: String, default: 'faculty' },
    date: { type: Date, default: Date.now }
});

// The third argument 'users' matches your Compass collection exactly
mongoose.model('users', FacultySchema, 'users');