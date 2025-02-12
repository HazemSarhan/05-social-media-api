import { StatusCodes } from 'http-status-codes';

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong. Try again later.',
  };

  return res.status(customError.statusCode).json({
    status: `Error`,
    message: customError.msg,
  });
};

export default errorHandlerMiddleware;
