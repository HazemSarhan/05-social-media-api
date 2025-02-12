import UnauthorizedError from '../errors/UnauthorizedError.js';

const checkPermission = (requestUser, recourseUserId) => {
  if (requestUser.role === 'ADMIN') return;
  if (requestUser.userId === recourseUserId.toString()) return;
  throw new UnauthorizedError('Not authorized to access this route');
};

export default checkPermission;
