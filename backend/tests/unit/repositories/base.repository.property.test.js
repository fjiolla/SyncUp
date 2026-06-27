import { vi, describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { BaseRepository } from '../../../src/repositories/base.repository.js';

/**
 * Property 13: Soft delete exclusion in read operations
 * Read operations without includeDeleted=true exclude documents where deletedAt is not null;
 * with includeDeleted=true no exclusion is applied.
 *
 * **Validates: Requirements 13.7**
 */

/**
 * Creates a mock Mongoose model that records all query filters/conditions.
 * The chainable object mimics Mongoose Query behavior (thenable).
 */
function createMockModel() {
  let lastWhereArgs = null;

  const chainable = {
    where: vi.fn(function (conditions) {
      lastWhereArgs = conditions;
      return chainable;
    }),
    populate: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    lean: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue(null),
    // Make chainable thenable (awaitable) - resolves with a dummy document
    then: function (resolve, reject) {
      return Promise.resolve({ _id: 'mock-id', deletedAt: null }).then(resolve, reject);
    },
  };

  const model = {
    findById: vi.fn().mockReturnValue(chainable),
    findOne: vi.fn().mockReturnValue(chainable),
    find: vi.fn().mockReturnValue(chainable),
    countDocuments: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockResolvedValue({}),
    findOneAndUpdate: vi.fn().mockResolvedValue(null),
    aggregate: vi.fn().mockResolvedValue([]),
    exists: vi.fn().mockResolvedValue(null),
  };

  return { model, chainable, getLastWhereArgs: () => lastWhereArgs, resetWhereArgs: () => { lastWhereArgs = null; } };
}

/**
 * Arbitrary generator for filter objects with safe keys (excluding 'deletedAt')
 * to ensure the soft-delete condition is applied independently of user-provided filters.
 */
const filterArbitrary = fc.dictionary(
  fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,9}$/).filter((s) => s !== 'deletedAt'),
  fc.oneof(
    fc.string({ minLength: 1, maxLength: 20 }),
    fc.integer(),
    fc.boolean()
  )
);

describe('BaseRepository - Property 13: Soft delete exclusion in read operations', () => {
  let mockModel;
  let chainable;
  let repo;
  let resetWhereArgs;

  beforeEach(() => {
    const mocks = createMockModel();
    mockModel = mocks.model;
    chainable = mocks.chainable;
    resetWhereArgs = mocks.resetWhereArgs;
    repo = new BaseRepository(mockModel);
  });

  describe('find() soft delete exclusion', () => {
    it('should include deletedAt:null in filter when includeDeleted is false (default)', async () => {
      await fc.assert(
        fc.asyncProperty(filterArbitrary, async (filter) => {
          mockModel.find.mockClear();
          chainable.sort.mockClear();
          chainable.populate.mockClear();
          chainable.select.mockClear();
          chainable.lean.mockClear();

          await repo.find(filter);

          const calledFilter = mockModel.find.mock.calls[0][0];
          // deletedAt: null must be included
          if (calledFilter.deletedAt !== null) return false;
          // All original filter keys should still be present
          for (const key of Object.keys(filter)) {
            if (calledFilter[key] !== filter[key]) return false;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should NOT include deletedAt:null in filter when includeDeleted is true', async () => {
      await fc.assert(
        fc.asyncProperty(filterArbitrary, async (filter) => {
          mockModel.find.mockClear();

          await repo.find(filter, { includeDeleted: true });

          const calledFilter = mockModel.find.mock.calls[0][0];
          // deletedAt should NOT be in the filter
          if ('deletedAt' in calledFilter) return false;
          // All original filter keys should still be present
          for (const key of Object.keys(filter)) {
            if (calledFilter[key] !== filter[key]) return false;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('findOne() soft delete exclusion', () => {
    it('should include deletedAt:null in filter when includeDeleted is false (default)', async () => {
      await fc.assert(
        fc.asyncProperty(filterArbitrary, async (filter) => {
          mockModel.findOne.mockClear();

          await repo.findOne(filter);

          const calledFilter = mockModel.findOne.mock.calls[0][0];
          if (calledFilter.deletedAt !== null) return false;
          for (const key of Object.keys(filter)) {
            if (calledFilter[key] !== filter[key]) return false;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should NOT include deletedAt:null in filter when includeDeleted is true', async () => {
      await fc.assert(
        fc.asyncProperty(filterArbitrary, async (filter) => {
          mockModel.findOne.mockClear();

          await repo.findOne(filter, { includeDeleted: true });

          const calledFilter = mockModel.findOne.mock.calls[0][0];
          if ('deletedAt' in calledFilter) return false;
          for (const key of Object.keys(filter)) {
            if (calledFilter[key] !== filter[key]) return false;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('findById() soft delete exclusion', () => {
    it('should call .where({deletedAt: null}) when includeDeleted is false (default)', async () => {
      await fc.assert(
        fc.asyncProperty(fc.hexaString({ minLength: 24, maxLength: 24 }), async (id) => {
          mockModel.findById.mockClear();
          chainable.where.mockClear();
          resetWhereArgs();

          await repo.findById(id);

          // .where should have been called with { deletedAt: null }
          if (chainable.where.mock.calls.length !== 1) return false;
          const whereArg = chainable.where.mock.calls[0][0];
          return whereArg.deletedAt === null;
        }),
        { numRuns: 100 }
      );
    });

    it('should NOT call .where({deletedAt: null}) when includeDeleted is true', async () => {
      await fc.assert(
        fc.asyncProperty(fc.hexaString({ minLength: 24, maxLength: 24 }), async (id) => {
          mockModel.findById.mockClear();
          chainable.where.mockClear();
          resetWhereArgs();

          await repo.findById(id, { includeDeleted: true });

          // .where should NOT have been called
          return chainable.where.mock.calls.length === 0;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('paginate() soft delete exclusion', () => {
    it('should include deletedAt:null in filter when includeDeleted is false (default)', async () => {
      await fc.assert(
        fc.asyncProperty(filterArbitrary, async (filter) => {
          mockModel.find.mockClear();
          mockModel.countDocuments.mockClear();
          mockModel.countDocuments.mockResolvedValue(0);

          await repo.paginate({ filter });

          const findFilter = mockModel.find.mock.calls[0][0];
          const countFilter = mockModel.countDocuments.mock.calls[0][0];
          // Both find and countDocuments should have deletedAt: null
          if (findFilter.deletedAt !== null) return false;
          if (countFilter.deletedAt !== null) return false;
          // All original filter keys should still be present
          for (const key of Object.keys(filter)) {
            if (findFilter[key] !== filter[key]) return false;
            if (countFilter[key] !== filter[key]) return false;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should NOT include deletedAt:null in filter when includeDeleted is true', async () => {
      await fc.assert(
        fc.asyncProperty(filterArbitrary, async (filter) => {
          mockModel.find.mockClear();
          mockModel.countDocuments.mockClear();
          mockModel.countDocuments.mockResolvedValue(0);

          await repo.paginate({ filter, includeDeleted: true });

          const findFilter = mockModel.find.mock.calls[0][0];
          const countFilter = mockModel.countDocuments.mock.calls[0][0];
          // Neither should have deletedAt
          if ('deletedAt' in findFilter) return false;
          if ('deletedAt' in countFilter) return false;
          // All original filter keys should still be present
          for (const key of Object.keys(filter)) {
            if (findFilter[key] !== filter[key]) return false;
            if (countFilter[key] !== filter[key]) return false;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
