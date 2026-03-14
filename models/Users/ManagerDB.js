const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ManagerSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    type: { type: String, default: 'manager' },
    date: { type: Date, default: Date.now }
});

// The third argument 'management_user' forces it to use that exact collection name
mongoose.model('management_user', ManagerSchema, 'management_user');