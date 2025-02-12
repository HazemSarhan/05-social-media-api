import { StatusCodes } from 'http-status-codes';
import APIError from './APIError.js';

class UnauthorizedError extends APIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

export default UnauthorizedError;
