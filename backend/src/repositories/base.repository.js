import { ApiError } from '../exceptions/ApiError.js';

export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id, { populate, select, lean = true, includeDeleted = false } = {}) {
    let query = this.model.findById(id);
    if (!includeDeleted) query = query.where({ deletedAt: null });
    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);
    if (lean) query = query.lean();
    const doc = await query;
    if (!doc) throw ApiError.notFound('Resource not found');
    return doc;
  }

  async findOne(filter, { populate, select, lean = true, includeDeleted = false } = {}) {
    const queryFilter = includeDeleted ? filter : { ...filter, deletedAt: null };
    let query = this.model.findOne(queryFilter);
    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);
    if (lean) query = query.lean();
    return query;
  }

  async find(filter, { sort, populate, select, lean = true, includeDeleted = false } = {}) {
    const queryFilter = includeDeleted ? filter : { ...filter, deletedAt: null };
    let query = this.model.find(queryFilter);
    if (sort) query = query.sort(sort);
    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);
    if (lean) query = query.lean();
    return query;
  }

  async update(id, updateData) {
    const doc = await this.model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      updateData,
      { new: true, runValidators: true }
    );
    if (!doc) throw ApiError.notFound('Resource not found');
    return doc;
  }

  async delete(id) {
    const doc = await this.model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!doc) throw ApiError.notFound('Resource not found');
    return doc;
  }

  async paginate({ page = 1, limit = 10, filter = {}, sort, populate, select, includeDeleted = false } = {}) {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(100, limit));

    const queryFilter = includeDeleted ? filter : { ...filter, deletedAt: null };
    const total = await this.model.countDocuments(queryFilter);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    let query = this.model.find(queryFilter).skip(skip).limit(limit);
    if (sort) query = query.sort(sort);
    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);
    query = query.lean();

    const results = await query;

    return {
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }

  async exists(filter) {
    const doc = await this.model.exists({ ...filter, deletedAt: null });
    return !!doc;
  }
}
