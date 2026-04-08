const mongoose = require('mongoose');

// Just register the model name, don't require the file here
const StaffAppraisal = mongoose.model('StaffAppraisal');

module.exports = { StaffAppraisal };