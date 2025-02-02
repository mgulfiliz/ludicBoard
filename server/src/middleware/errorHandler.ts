import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

// Custom error class
class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 'error',
      errors: errors.array().map(err => ({
        field: (err as any).path || (err as any).param || 'unknown',
        message: err.msg
      }))
    });
  }
  next();
};

// Global error handler
const globalErrorHandler = (
  err: AppError | Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const error = err instanceof AppError ? err : new AppError(err.message, 500);

  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export { 
  AppError, 
  validateRequest, 
  globalErrorHandler 
};
