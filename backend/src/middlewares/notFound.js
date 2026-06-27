import { ResponseFormatter } from '../utils/responseFormatter.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const notFound = (req, res, next) => {
  ResponseFormatter.error(res, {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
