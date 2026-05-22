import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`[Error] ${err.message}`, err.stack);
  res.status(500).json({
    code: '500',
    msg: err.message || 'Internal Server Error',
    data: null,
    success: false,
  });
}
