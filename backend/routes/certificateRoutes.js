const express = require('express');
const router = express.Router();
const {
  generateCertificate,
  getMyCertificates,
  verifyCertificate,
  downloadCertificatePdf,
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateCertificate);
router.get('/', protect, getMyCertificates);
router.get('/verify/:certificateNumber', verifyCertificate);
router.get('/:id/download', downloadCertificatePdf);

module.exports = router;
