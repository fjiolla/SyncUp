export const ResponseFormatter = {
  success(res, { statusCode = 200, message, data = null }) {
    return res.status(statusCode).json({ success: true, message, data });
  },

  error(res, { statusCode = 500, message, errors = null }) {
    return res.status(statusCode).json({ success: false, message, errors });
  },

  paginated(res, { statusCode = 200, message, data, pagination }) {
    const { page, limit, total } = pagination;
    const totalPages = Math.ceil(total / limit);

    return res.status(statusCode).json({
      success: true,
      message,
      data: {
        results: data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  },
};
