import { isTokenValid } from '../utils/jwt.js';
import UnauthenticatedError from '../errors/UnauthenticatedError.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const authenticateUser = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;

  try {
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = payload.user;
      return next();
    }
    const payload = isTokenValid(refreshToken);
    const existingToken = await prisma.token.findFirst({
      where: {
        userId: payload.user.userId,
        refreshToken: payload.refreshToken,
      },
    });
    if (!existingToken || !existingToken?.isValid) {
      throw new UnauthenticatedError('Authentication Invalid');
    }

    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });
    req.user = payload.user;
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication Invalid');
  }
};

export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('Unauthorized to access this route');
    }
    next();
  };
};
