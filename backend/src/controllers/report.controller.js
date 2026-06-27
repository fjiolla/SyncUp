import { asyncHandler } from '../middlewares/asyncHandler.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';
import { ApiError } from '../exceptions/ApiError.js';
import { ReportRepository } from '../repositories/report.repository.js';

export const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason, description } = req.body;
  const existing = await ReportRepository.findExisting(req.user._id, targetType, targetId);
  if (existing) throw ApiError.conflict('You already reported this');

  const report = await ReportRepository.create({
    reporter: req.user._id,
    targetType, targetId, reason, description: description || '',
  });

  return ResponseFormatter.success(res, { statusCode: 201, message: 'Report submitted. Thank you for helping keep SyncUp safe.', data: report });
});

export const listReports = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await ReportRepository.listByStatus({ page, limit, status });
  return ResponseFormatter.paginated(res, { message: 'Reports retrieved', data: result.results, pagination: result.pagination });
});

export const resolveReport = asyncHandler(async (req, res) => {
  const { status, resolution } = req.body;
  await ReportRepository.update(req.params.reportId, {
    status, resolution: resolution || '', resolvedBy: req.user._id,
  });
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Report updated' });
});
