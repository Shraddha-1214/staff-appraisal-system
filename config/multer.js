const multer = require('multer');
const path = require('path');

// Set Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        // Naming format: Fieldname-Date.extension
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // Max 5MB per file
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('proofDocument'); // Match the 'name' attribute in your form

// Check File Type
function checkFileType(file, cb) {
    // Allowed extensions for WIT PBAS
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Please upload PDFs or Images only!');
    }
}

module.exports = upload;