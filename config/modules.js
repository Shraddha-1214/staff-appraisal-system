const mongoose = require('mongoose');

// Load Models with Capital P to match your screenshot
require('../models/Part1');
const Part1 = mongoose.model('part1'); // Keep 'part1' lowercase if that's how it's registered in the model file

require('../models/Part2');
const Part2 = mongoose.model('part2');

require('../models/Part3');
const Part3 = mongoose.model('part3');

require('../models/Part4');
const Part4 = mongoose.model('part4');

require('../models/Leave');
const Leave = mongoose.model('leaves');

module.exports = {
    Part1,
    Part2,
    Part3,
    Part4,
    Leave
}