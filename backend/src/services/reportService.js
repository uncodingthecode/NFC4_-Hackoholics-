import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import geminiService from './geminiService.js';
import User from '../models/user.model.js';
import Vital from '../models/vital.model.js';
import Medication from '../models/medication.model.js';
import Prescription from '../models/prescription.model.js';
import Report from '../models/report.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReportService {
  async generateComprehensiveReport(userId, reportType = 'comprehensive', dateRange = null) {
    try {
      // Fetch user data
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Fetch health data
      const vitals = await this.getVitalsData(userId, dateRange);
      const medications = await this.getMedicationsData(userId, dateRange);
      const prescriptions = await this.getPrescriptionsData(userId, dateRange);

      // Generate AI insights
      let aiContent = '';
      let reportTitle = '';

      switch (reportType) {
        case 'health_summary':
          aiContent = await geminiService.generateHealthReport(user, vitals, medications, prescriptions);
          reportTitle = 'Health Summary Report';
          break;
        case 'vital_trends':
          aiContent = await geminiService.generateVitalTrendsAnalysis(vitals);
          reportTitle = 'Vital Signs Trends Report';
          break;
        case 'medication_report':
          aiContent = await geminiService.generateMedicationInsights(medications, vitals);
          reportTitle = 'Medication Analysis Report';
          break;
        case 'comprehensive':
        default:
          aiContent = await geminiService.generateHealthReport(user, vitals, medications, prescriptions);
          reportTitle = 'Comprehensive Health Report';
          break;
      }

      // Generate PDF
      const pdfBuffer = await this.generatePDF(reportTitle, aiContent, user, vitals, medications, prescriptions);

      // Upload to Cloudinary
      const pdfUrl = await this.uploadPDF(pdfBuffer, userId);

      // Save report to database
      const report = new Report({
        user_id: userId,
        title: reportTitle,
        type: reportType,
        content: aiContent,
        ai_generated: true,
        data_period: dateRange,
        pdf_url: pdfUrl,
      });

      await report.save();

      return {
        success: true,
        report: report,
        pdf_url: pdfUrl,
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async generatePDF(title, content, user, vitals, medications, prescriptions) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Add header
        doc.fontSize(24).text(title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated for: ${user.name}`, { align: 'center' });
        doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        // Add content
        doc.fontSize(12).text(content);
        doc.moveDown(2);

        // Add data summary
        this.addDataSummary(doc, vitals, medications, prescriptions);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  addDataSummary(doc, vitals, medications, prescriptions) {
    doc.fontSize(14).text('Data Summary', { underline: true });
    doc.moveDown();

    // Vitals summary
    if (vitals.length > 0) {
      doc.fontSize(12).text('Vital Signs:', { underline: true });
      const latestVital = vitals[0];
      doc.fontSize(10).text(`Latest BP: ${latestVital.bp_systolic}/${latestVital.bp_diastolic} mmHg`);
      doc.fontSize(10).text(`Latest Sugar: ${latestVital.sugar} mg/dL`);
      doc.fontSize(10).text(`Latest Weight: ${latestVital.weight} kg`);
      doc.moveDown();
    }

    // Medications summary
    if (medications.length > 0) {
      doc.fontSize(12).text('Active Medications:', { underline: true });
      medications.forEach(med => {
        doc.fontSize(10).text(`• ${med.name} - ${med.dosage} ${med.frequency}`);
      });
      doc.moveDown();
    }

    // Prescriptions summary
    if (prescriptions.length > 0) {
      doc.fontSize(12).text('Recent Prescriptions:', { underline: true });
      prescriptions.slice(0, 5).forEach(prescription => {
        doc.fontSize(10).text(`• ${prescription.medication_name} - ${prescription.dosage}`);
      });
    }
  }

  async uploadPDF(pdfBuffer, userId) {
    try {
      const result = await uploadToCloudinary(pdfBuffer, `reports/${userId}/${Date.now()}.pdf`, 'raw');
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw new Error('Failed to upload PDF');
    }
  }

  async getVitalsData(userId, dateRange) {
    const query = { user_id: userId };
    if (dateRange && dateRange.start_date && dateRange.end_date) {
      query.timestamp = {
        $gte: new Date(dateRange.start_date),
        $lte: new Date(dateRange.end_date),
      };
    }
    return await Vital.find(query).sort({ timestamp: -1 }).limit(50);
  }

  async getMedicationsData(userId, dateRange) {
    const query = { user_id: userId };
    if (dateRange && dateRange.start_date && dateRange.end_date) {
      query.createdAt = {
        $gte: new Date(dateRange.start_date),
        $lte: new Date(dateRange.end_date),
      };
    }
    return await Medication.find(query).sort({ createdAt: -1 });
  }

  async getPrescriptionsData(userId, dateRange) {
    const query = { user_id: userId };
    if (dateRange && dateRange.start_date && dateRange.end_date) {
      query.createdAt = {
        $gte: new Date(dateRange.start_date),
        $lte: new Date(dateRange.end_date),
      };
    }
    return await Prescription.find(query).sort({ createdAt: -1 });
  }

  async getReportsByUser(userId) {
    return await Report.find({ user_id: userId }).sort({ generated_at: -1 });
  }

  async shareReport(reportId, targetUserId) {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Check if already shared
    const alreadyShared = report.shared_with.find(share => share.user_id.toString() === targetUserId);
    if (alreadyShared) {
      throw new Error('Report already shared with this user');
    }

    report.shared_with.push({
      user_id: targetUserId,
      shared_at: new Date(),
    });

    await report.save();
    return report;
  }
}

export default new ReportService(); 