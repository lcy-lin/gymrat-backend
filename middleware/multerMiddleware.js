import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const uploadDir = path.join(path.dirname(__filename), '../uploads/');

function multerMiddleware(req, res, next) {
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
        const filename = Date.now() + '-' + file.originalname;
        req.body.picture = filename;
        cb(null, filename);
      },
    }),
    limits: {
      fileSize: 2048 * 2048,
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type. Accepted types: JPEG, PNG, GIF'));
      }
    },
  }).single('picture');

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    } else if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    next();
  });
}

export default multerMiddleware;
