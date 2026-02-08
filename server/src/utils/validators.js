import mongoose from 'mongoose';
import { AppError } from './AppError.js';

/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @param {string} [fieldName='id'] - Name of the field for error message
 * @throws {AppError} If ID is invalid
 */
export function validateObjectId(id, fieldName = 'id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest(`Invalid ${fieldName}`);
  }
}

/**
 * Validate multiple ObjectIds
 * @param {string[]} ids - Array of IDs to validate
 * @param {string} [fieldName='id'] - Name of the field for error message
 * @throws {AppError} If any ID is invalid
 */
export function validateObjectIds(ids, fieldName = 'id') {
  if (!Array.isArray(ids)) {
    throw AppError.badRequest(`${fieldName} must be an array`);
  }

  for (const id of ids) {
    validateObjectId(id, fieldName);
  }
}
