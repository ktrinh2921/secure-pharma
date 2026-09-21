/**
 * Error Handler Middleware
 */
const winston = require('../utils/logger');

/**
 * Sensitive fields to redact from logs
 */
const SENSITIVE_FIELDS = [
    'password',
    'currentPassword',
    'newPassword',
    'confirmPassword',
    'matKhau',
    'matKhauCu',
    'matKhauMoi',
    'token',
    'refreshToken',
    'jwt',
    'authorization',
    'cookie',
    'secret',
    'apiKey',
    'accessToken',
];

/**
 * Recursively redact sensitive fields from an object.
 * Handles null, undefined, arrays, and nested objects.
 * @param {any} obj - The object to redact
 * @returns {any} - A copy with sensitive fields replaced by [REDACTED]
 */
function redactBody(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => redactBody(item));
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    const redacted = {};
    for (const key of Object.keys(obj)) {
        if (SENSITIVE_FIELDS.includes(key)) {
            redacted[key] = '[REDACTED]';
        } else {
            const value = obj[key];
            if (value !== null && typeof value === 'object') {
                redacted[key] = redactBody(value);
            } else {
                redacted[key] = value;
            }
        }
    }
    return redacted;
}

/**
 * Not Found Handler - 404
 */
function notFoundHandler(req, res, next) {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.originalUrl} not found`
        }
    });
}

/**
 * Global Error Handler
 */
function errorHandler(err, req, res, next) {
    // Log theo mức độ nghiêm trọng:
    //  - 5xx (server fault) -> error (cần on-call can thiệp)
    //  - 4xx (client fault / business rule) -> warn với prefix khác
    //    để tránh khớp pattern `Error|throw|Cannot|...` ở log watcher
    //  - còn lại -> error mặc định
    const status = err.statusCode || 500;
    const logPayload = {
        originalUrl: req.originalUrl,
        method: req.method,
        body: redactBody(req.body),
        stack: err.stack,
        ip: req.ip,
    };
    if (status >= 500) {
        winston.error(`${err.name}: ${err.message}`, logPayload);
    } else if (status >= 400) {
        // 4xx: log ngắn gọn ở mức warn, KHÔNG chứa chữ "Error/throw/Cannot/..."
        // để không trigger alarm pattern log.
        winston.warn(
            `[4xx reject ${status}] ${err.message} [${req.method} ${req.originalUrl}]`
        );
    } else {
        winston.error(`${err.name}: ${err.message}`, logPayload);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Dữ liệu không hợp lệ',
                details: err.message
            }
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Token không hợp lệ'
            }
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_EXPIRED',
                message: 'Token đã hết hạn'
            }
        });
    }

    // Custom application error
    if (err.isOperational) {
        return res.status(err.statusCode || 400).json({
            success: false,
            error: {
                code: err.code || 'APP_ERROR',
                message: err.message
            }
        });
    }

    // SQL Server error
    if (err.number) {
        // Trong dev: trả về message gốc của SQL Server để FE/dev tự debug nhanh
        // (vd: "Invalid column name 'MustChangePassword'" thay vì "Lỗi cơ sở dữ liệu").
        // Production: vẫn ẩn chi tiết, chỉ mã lỗi để tránh lộ schema.
        const isDev = process.env.NODE_ENV !== 'production';
        return res.status(500).json({
            success: false,
            error: {
                code: `DB_ERROR_${err.number}`,
                message: isDev ? err.message : 'Lỗi cơ sở dữ liệu',
                sqlErrorNumber: isDev ? err.number : undefined,
            }
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production' 
                ? 'Đã xảy ra lỗi không xác định' 
                : err.message
        }
    });
}

/**
 * Async Handler Wrapper - Handle async errors
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Create custom application error
 */
class AppError extends Error {
    constructor(message, statusCode = 400, code = 'APP_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    notFoundHandler,
    errorHandler,
    asyncHandler,
    AppError,
    redactBody,
};
