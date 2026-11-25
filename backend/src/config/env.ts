import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  rawgApiKey: process.env.RAWG_API_KEY || '',
  rawgBaseUrl: process.env.RAWG_BASE_URL || 'https://api.rawg.io/api',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
