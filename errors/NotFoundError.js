import { StatusCodes } from 'http-status-codes';
import APIError from './APIError.js';

class NotFoundError extends APIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

export default NotFoundError;
