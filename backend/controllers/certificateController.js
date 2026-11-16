const PDFDocument = require('pdfkit');
const { query } = require('../config/db');

/**
 * @desc    Issue a Certificate if course completion criteria are satisfied
 * @route   POST /api/certificates/generate
 * @access  Private (Student)
 */
const generateCertificate = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({ status: 'fail', message: 'Course ID is required.' });
    }

    const courseId = parseInt(course_id, 10);

    // 1. Verify existing enrollment
    const enrollRes = await query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );

    if (enrollRes.rowCount === 0) {
      return res.status(403).json({ status: 'fail', message: 'You are not enrolled in this course.' });
    }

    // 2. Check if certificate already issued
    const existingCert = await query(
      'SELECT * FROM certificates WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );

    if (existingCert.rowCount > 0) {
      return res.status(200).json({
        status: 'success',
        message: 'Certificate already issued.',
        data: { certificate: existingCert.rows[0] },
      });
    }

    // 3. Generate unique certificate number
    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const certificateNumber = `SKILLBRIDGE-${year}-${randomHex}`;
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/certificates/verify/${certificateNumber}`;

    const insertRes = await query(
      `INSERT INTO certificates (student_id, course_id, certificate_number, certificate_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [studentId, courseId, certificateNumber, verificationUrl]
    );

    res.status(201).json({
      status: 'success',
      message: 'Congratulations! Your certificate has been officially issued.',
      data: { certificate: insertRes.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all certificates for logged in student
 * @route   GET /api/certificates
 * @access  Private (Student)
 */
const getMyCertificates = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const certsRes = await query(
      `SELECT 
        cert.*,
        c.title AS course_title,
        c.thumbnail AS course_thumbnail,
        u.full_name AS instructor_name
       FROM certificates cert
       JOIN courses c ON c.id = cert.course_id
       JOIN users u ON u.id = c.instructor_id
       WHERE cert.student_id = $1
       ORDER BY cert.issued_at DESC`,
      [studentId]
    );

    res.status(200).json({
      status: 'success',
      data: { certificates: certsRes.rows },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify certificate publicly by serial number
 * @route   GET /api/certificates/verify/:certificateNumber
 * @access  Public
 */
const verifyCertificate = async (req, res, next) => {
  try {
    const { certificateNumber } = req.params;

    const certRes = await query(
      `SELECT 
        cert.id,
        cert.certificate_number,
        cert.issued_at,
        u.full_name AS student_name,
        c.title AS course_title,
        c.duration,
        inst.full_name AS instructor_name
       FROM certificates cert
       JOIN users u ON u.id = cert.student_id
       JOIN courses c ON c.id = cert.course_id
       JOIN users inst ON inst.id = c.instructor_id
       WHERE UPPER(cert.certificate_number) = UPPER($1)`,
      [certificateNumber.trim()]
    );

    if (certRes.rowCount === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No verified certificate exists with this credential ID.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        certificate: certRes.rows[0],
        is_verified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate and stream downloadable PDF certificate
 * @route   GET /api/certificates/:id/download
 * @access  Private / Public
 */
const downloadCertificatePdf = async (req, res, next) => {
  try {
    const certId = parseInt(req.params.id, 10);

    const certRes = await query(
      `SELECT 
        cert.*,
        u.full_name AS student_name,
        c.title AS course_title,
        inst.full_name AS instructor_name
       FROM certificates cert
       JOIN users u ON u.id = cert.student_id
       JOIN courses c ON c.id = cert.course_id
       JOIN users inst ON inst.id = c.instructor_id
       WHERE cert.id = $1`,
      [certId]
    );

    if (certRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Certificate not found.' });
    }

    const cert = certRes.rows[0];

    // Create a PDF document in Landscape
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 40,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="SkillBridge-Certificate-${cert.certificate_number}.pdf"`
    );

    doc.pipe(res);

    // Decorative Borders
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(4).stroke('#0f172a');
    doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52).lineWidth(1.5).stroke('#2563eb');

    // Header Branding
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#0f172a').text('SkillBridge', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('ONLINE LEARNING & SKILL DEVELOPMENT PLATFORM', { align: 'center', characterSpacing: 2 });

    doc.moveDown(1.5);
    doc.fontSize(14).font('Helvetica').fillColor('#334155').text('CERTIFICATE OF ACHIEVEMENT', { align: 'center', characterSpacing: 3 });

    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica').fillColor('#64748b').text('This credential is proudly awarded to', { align: 'center' });

    doc.moveDown(0.8);
    doc.fontSize(26).font('Helvetica-Bold').fillColor('#2563eb').text(cert.student_name, { align: 'center' });

    doc.moveDown(0.8);
    doc.fontSize(12).font('Helvetica').fillColor('#64748b').text('for successfully completing all curriculum requirements, quizzes, and projects in', { align: 'center' });

    doc.moveDown(0.8);
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#0f172a').text(cert.course_title, { align: 'center' });

    doc.moveDown(2);

    // Signatures and Metadata Row
    const yPos = 460;

    // Left: Instructor
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text(cert.instructor_name, 100, yPos, { width: 200, align: 'center' });
    doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('Lead Course Instructor', 100, yPos + 16, { width: 200, align: 'center' });
    doc.moveTo(100, yPos - 5).lineTo(300, yPos - 5).stroke('#cbd5e1');

    // Right: Date & Verification
    const issuedDate = new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text(issuedDate, doc.page.width - 300, yPos, { width: 200, align: 'center' });
    doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(`Credential ID: ${cert.certificate_number}`, doc.page.width - 300, yPos + 16, { width: 200, align: 'center' });
    doc.moveTo(doc.page.width - 300, yPos - 5).lineTo(doc.page.width - 100, yPos - 5).stroke('#cbd5e1');

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateCertificate,
  getMyCertificates,
  verifyCertificate,
  downloadCertificatePdf,
};

