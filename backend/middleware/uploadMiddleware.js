const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 25000000 }, // 25MB limit for high-quality images and 3D models
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const imageDocExt = /\.(jpeg|jpg|png|pdf|doc|docx)$/;
        const modelExt = /\.(glb|gltf)$/;
        const mimeOk = /image\/jpeg|image\/jpg|image\/png|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|model\/gltf-binary|model\/gltf\+json|application\/octet-stream/.test(file.mimetype);

        if ((imageDocExt.test(ext) || modelExt.test(ext)) && mimeOk) {
            return cb(null, true);
        } else {
            cb('Error: Only images (jpeg, jpg, png), documents (pdf, doc, docx), and 3D files (glb, gltf) are allowed!');
        }
    }
});

module.exports = upload;
