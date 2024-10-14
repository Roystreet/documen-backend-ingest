const router = require('express').Router();
const multer = require('multer');
const documentController = require('../controllers/documentController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  });
  
  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      // Acepta cualquier tipo de archivo
      cb(null, true);
    },
  });

// Rutas para documentos
router.post('/upload', upload.single('file'), documentController.uploadDocument);
router.get('/:id', documentController.getDocumentById);
router.get('/', documentController.getAllDocuments);
router.delete('/:id', documentController.deleteDocumentById);
router.post('/query', documentController.answerQuery);

module.exports = router;