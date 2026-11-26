import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    })
  );
  app.use(express.json());

  app.use('/api', apiRoutes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'NOT_FOUND',
      message: 'Ruta solicitată nu există',
    });
  });

  app.use(errorHandler);

  return app;
}

const app = createApp();

export default app;
