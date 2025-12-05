/**
 * JWT token generation and validation utilities
 * Implements access/refresh token pattern
 */

import jwt from 'jsonwebtoken';

export interface TokenPayload {
  sub: string; // user ID
  firmId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

const getJwtRefreshSecret = (): string => {
  return process.env.JWT_REFRESH_SECRET || getJwtSecret();
};

/**
 * Generate access and refresh token pair
 */
export const generateTokenPair = (
  userId: string,
  firmId: string,
  email: string,
  role: string
): TokenPair => {
  const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
    sub: userId,
    firmId,
    email,
    role,
  };

  const accessToken = jwt.sign(payload, getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'demand-letter-generator',
  });

  const refreshToken = jwt.sign(payload, getJwtRefreshSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: 'demand-letter-generator',
  });

  return { accessToken, refreshToken };
};

/**
 * Verify and decode access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
};

/**
 * Verify and decode refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, getJwtRefreshSecret()) as TokenPayload;
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): TokenPayload | null => {
  return jwt.decode(token) as TokenPayload | null;
};
