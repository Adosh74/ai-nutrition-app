import type { Request, Response } from 'express';

import express from 'express';

import { NotFound } from './errors/not-found-error';
import { errorHandler } from './middlewares/error-handler';
import { indexRouter } from './routes/index-route';

const app = express();

app.use(express.json());

app.get('/healthz', (_req: Request, res: Response) => {
  res.sendStatus(200);
});

app.use('/api/v1', indexRouter);

app.use((_req: Request, _res: Response, next) => {
  const error = new NotFound();
  next(error);
});

app.use(errorHandler);

export { app };
