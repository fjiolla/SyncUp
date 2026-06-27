import { cloudinary } from '../config/cloudinary.js';
import { ApiError } from '../exceptions/ApiError.js';
import { logger } from '../logger/index.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const UploadService = {
  async uploadImage(file, folder) {
    if (Buffer.isBuffer(file) && file.length > MAX_FILE_SIZE) {
      throw ApiError.badRequest('File size exceeds maximum of 10MB');
    }

    try {
      let uploadSource = file;
      if (Buffer.isBuffer(file)) {
        uploadSource = `data:image/png;base64,${file.toString('base64')}`;
      }

      const result = await cloudinary.uploader.upload(uploadSource, {
        folder,
        angle: 'exif',
        image_metadata: true,
        fetch_format: 'auto',
        quality: 'auto',
      });
      return { secureUrl: result.secure_url, publicId: result.public_id };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error({ err, folder }, 'Cloudinary upload failed');
      throw ApiError.internal(err.message || 'Image upload failed');
    }
  },

  async uploadMultipleImages(files, folder) {
    if (files.length > 10) {
      throw ApiError.badRequest('Cannot upload more than 10 images at once');
    }
    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  },

  async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      logger.error({ err, publicId }, 'Cloudinary delete failed');
      throw ApiError.internal(err.message || 'Image deletion failed');
    }
  },

  async replaceImage(oldPublicId, newFile, folder) {
    await this.deleteImage(oldPublicId);
    return this.uploadImage(newFile, folder);
  },
};
