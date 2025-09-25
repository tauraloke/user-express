import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
    code?: string | number;
    errors?: Record<string, { message: string }>;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error(err);

    // TypeORM/SQLite duplicate key error
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { ...error, message, statusCode: 400 };
    }

    // TypeORM validation error
    if (err.name === 'ValidationError' && err.errors) {
        const messages = Object.values(err.errors).map(val => val.message || 'Validation error');
        const message = messages.join(', ');
        error = { ...error, message, statusCode: 400 };
    }

    // Invalid UUID format
    if (err.message?.includes('invalid input syntax for type uuid')) {
        const message = 'Invalid UUID format';
        error = { ...error, message, statusCode: 400 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};