const multer = require('multer');
const path = require('path');

// 1. Set Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        // Naming format: Fieldname-Date.extension
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// 2. Initialize Multer Instance (The Engine)
const multerInstance = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // Max 5MB per file
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

// 3. Check File Type
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

// 4. Export the .array() middleware (Supports up to 20 files at once)
module.exports = multerInstance.array('proofDocument', 20);