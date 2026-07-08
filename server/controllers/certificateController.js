const PDFDocument = require('pdfkit');
const Certificate = require('../models/Certificate');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');

exports.getUserCertificates = asyncHandler(async (req, res) => {
  const certs = await Certificate.findByUser(req.user.id);
  res.json({ status: 'success', data: { certificates: certs } });
});

exports.generateCertificatePDF = asyncHandler(async (req, res) => {
  const cert = await Certificate.findById(req.params.id, req.user.id);
  if (!cert) {
    throw new AppError('Certificate not found', 404);
  }
  
  try {
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 50
    });
    
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${cert.certificate_number}.pdf`);
    
    
    doc.pipe(res);
    
    
    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
       .lineWidth(4)
       .stroke('#24443B');
    
  
    doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100)
       .lineWidth(1)
       .stroke('#24443B');
    
   
    doc.fontSize(42)
       .font('Helvetica-Bold')
       .fillColor('#24443B')
       .text('Certificate of Completion', 0, 100, {
         align: 'center'
       });
    
    
    doc.moveTo(150, 160)
       .lineTo(doc.page.width - 150, 160)
       .lineWidth(2)
       .stroke('#24443B');
    
    
    doc.fontSize(36)
       .font('Helvetica-Bold')
       .fillColor('#1a365d')
       .text(`${cert.first_name} ${cert.last_name}`, 0, 210, {
         align: 'center'
       });
    
    
    doc.fontSize(18)
       .font('Helvetica')
       .fillColor('#333')
       .text('has successfully completed the course', 0, 280, {
         align: 'center'
       });
    
    
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor('#24443B')
       .text(cert.cohort_name, 0, 330, {
         align: 'center'
       });
    
   
    const issueDate = new Date(cert.issue_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#666')
       .text(`Issued on ${issueDate}`, 0, 400, {
         align: 'center'
       });
    
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#999')
       .text(`Certificate #: ${cert.certificate_number}`, 50, doc.page.height - 60);
    
  
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#24443B')
       .text('CohortHub Learning Platform', 0, doc.page.height - 60, {
         align: 'center'
       });
    
    doc.end();
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new AppError('Failed to generate certificate PDF', 500);
  }
});