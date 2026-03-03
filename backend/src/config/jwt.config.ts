import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
  expiresIn: parseInt(process.env.JWT_EXPIRATION, 10) || 3600,
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
  refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRATION, 10) || 604800,
}));
