import reportService from '../services/reportService.js';
import Report from '../models/report.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const generateReport = asyncHandler(async (req, res) => {
  const { reportType, startDate, endDate } = req.body;
  const userId = req.user._id;

  if (!reportType) {
    throw new ApiError(400, "Report type is required");
  }

  const dateRange = startDate && endDate ? { start_date: startDate, end_date: endDate } : null;

  const result = await reportService.generateComprehensiveReport(userId, reportType, dateRange);

  return res.status(200).json(
    new ApiResponse(200, result, "Report generated successfully")
  );
});

const getReports = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const reports = await reportService.getReportsByUser(userId);

  return res.status(200).json(
    new ApiResponse(200, reports, "Reports retrieved successfully")
  );
});

const getReportById = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const userId = req.user._id;

  const report = await Report.findOne({ _id: reportId, user_id: userId });
  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  return res.status(200).json(
    new ApiResponse(200, report, "Report retrieved successfully")
  );
});

const shareReport = asyncHandler(async (req, res) => {
  const { reportId, targetUserId } = req.body;
  const userId = req.user._id;

  if (!reportId || !targetUserId) {
    throw new ApiError(400, "Report ID and target user ID are required");
  }

  const result = await reportService.shareReport(reportId, targetUserId);

  return res.status(200).json(
    new ApiResponse(200, result, "Report shared successfully")
  );
});

const deleteReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const userId = req.user._id;

  const report = await Report.findOneAndDelete({ _id: reportId, user_id: userId });
  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Report deleted successfully")
  );
});

export {
  generateReport,
  getReports,
  getReportById,
  shareReport,
  deleteReport,
}; 