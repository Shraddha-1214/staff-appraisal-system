const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AcademicYearSchema = new Schema({
  academic_year: {
    type: String,
    required: true
  },
  user: {
    type: String, 
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('academic_year', AcademicYearSchema);