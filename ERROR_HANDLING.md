# Error Handling Documentation

This document describes the comprehensive error handling system implemented in this Express.js backend.

## Overview

The error handling system provides:
- **Centralized error handling** with consistent JSON responses
- **Comprehensive error coverage** for all error types
- **Structured logging** with Winston for debugging
- **Process-level error handlers** for unhandled exceptions
- **User-friendly messages** without exposing sensitive internals
- **Production-ready** error responses

## Error Response Format

All errors return a consistent JSON structure:

```json
{
  "errorName": "ErrorClassName",
  "errorCode": "ERROR_CODE",
  "httpStatus": 400,
  "message": "User-friendly error message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users",
  "details": {} // Optional, only in development or for specific errors
}
```

## Error Codes

Error codes follow a naming convention for easy identification:

### Client Errors (4xx)
- `USR_400` - Bad Request
- `USR_404` - Not Found
- `USR_405` - Method Not Allowed
- `USR_409` - Conflict
- `USR_422` - Unprocessable Entity

### Authentication & Authorization
- `AUTH_401` - Unauthorized
- `AUTH_403` - Forbidden
- `AUTH_USER_NOT_FOUND` - User not found
- `AUTH_EMAIL_ALREADY_EXISTS` - Email already exists
- `AUTH_INVALID_TOKEN` - Invalid authentication token
- `AUTH_TOKEN_EXPIRED` - Token expired
- `AUTH_INVALID_CREDENTIALS` - Invalid credentials
- `AUTH_ACCOUNT_LOCKED` - Account locked
- `AUTH_ACCOUNT_DISABLED` - Account disabled
- `AUTH_INSUFFICIENT_PERMISSIONS` - Insufficient permissions

### Validation Errors
- `VAL_400` - General validation error
- `VAL_REQUIRED_FIELD` - Required field missing
- `VAL_INVALID_FORMAT` - Invalid format
- `VAL_INVALID_TYPE` - Invalid type
- `VAL_OUT_OF_RANGE` - Value out of range
- `VAL_DUPLICATE_VALUE` - Duplicate value

### Rate Limiting
- `RATE_429` - Too Many Requests
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded

### Database Errors
- `DB_500` - Database error
- `DB_CONNECTION_ERROR` - Database connection error
- `DB_QUERY_ERROR` - Database query error
- `DB_TRANSACTION_ERROR` - Transaction error
- `DB_DUPLICATE_KEY` - Duplicate key error
- `DB_VALIDATION_ERROR` - Database validation error
- `DB_NOT_FOUND` - Database record not found

### External/Third-party API Errors
- `EXT_502` - Bad Gateway
- `EXT_503` - Service Unavailable
- `EXT_504` - Gateway Timeout
- `EXT_API_ERROR` - External API error
- `EXT_SERVICE_UNAVAILABLE` - External service unavailable
- `EXT_TIMEOUT` - External service timeout

### Server Errors (5xx)
- `SRV_500` - Internal Server Error
- `SRV_501` - Not Implemented
- `SRV_INTERNAL_ERROR` - Internal error
- `SRV_UNHANDLED_ERROR` - Unhandled error

### File Upload Errors
- `FILE_UPLOAD_ERROR` - File upload error
- `FILE_TOO_LARGE` - File too large
- `FILE_INVALID_TYPE` - Invalid file type
- `FILE_UPLOAD_FAILED` - File upload failed

## Error Classes

### Using Error Classes in Your Code

```typescript
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ValidationException,
  DatabaseException,
} from "./common/utils/app-error";

// Throw a bad request error
throw new BadRequestException("Invalid input provided");

// Throw with custom error code
throw new BadRequestException(
  "Email format is invalid",
  ErrorCodeEnum.VAL_INVALID_FORMAT
);

// Throw with details
throw new ValidationException("Validation failed", ErrorCodeEnum.VAL_400, {
  fields: ["email", "password"],
  errors: ["Email is required", "Password must be at least 8 characters"],
});

// Throw a not found error
throw new NotFoundException("User not found");

// Throw an unauthorized error
throw new UnauthorizedException("Invalid credentials");

// Throw a database error
throw new DatabaseException("Failed to save user");
```

## Error Handler Middleware

The error handler middleware automatically handles:

1. **AppError instances** - Custom application errors
2. **Mongoose errors** - Validation, cast, and duplicate key errors
3. **JSON syntax errors** - Malformed JSON in request body
4. **JWT errors** - Token validation and expiration
5. **Rate limit errors** - Too many requests
6. **File upload errors** - Multer errors
7. **Network errors** - Connection refused, timeouts
8. **Unknown errors** - Fallback for unhandled errors

## Process-Level Error Handlers

The system includes handlers for:

- **unhandledRejection** - Catches unhandled promise rejections
- **uncaughtException** - Catches uncaught synchronous errors
- **SIGTERM** - Graceful shutdown on termination signal
- **SIGINT** - Graceful shutdown on Ctrl+C

## Logging

All errors are logged with:
- Full error stack trace
- Request context (method, URL, IP, headers, body, params, query)
- Timestamp
- Environment information

Logs are written to:
- **Console** - In all environments (colored in development)
- **Files** - In production (daily rotation, 14-day retention)
  - `logs/error-YYYY-MM-DD.log` - Error logs only
  - `logs/combined-YYYY-MM-DD.log` - All logs

## Examples

### Example 1: Validation Error

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email"}'
```

**Response (400 Bad Request):**
```json
{
  "errorName": "ValidationException",
  "errorCode": "VAL_400",
  "httpStatus": 400,
  "message": "Validation failed. Please check your input",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users",
  "details": {
    "fields": ["email"],
    "errors": ["Invalid email format"]
  }
}
```

### Example 2: Not Found Error

**Request:**
```bash
curl -X GET http://localhost:8000/api/v1/users/999
```

**Response (404 Not Found):**
```json
{
  "errorName": "NotFoundException",
  "errorCode": "USR_404",
  "httpStatus": 404,
  "message": "The requested resource was not found",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users/999"
}
```

### Example 3: Unauthorized Error

**Request:**
```bash
curl -X GET http://localhost:8000/api/v1/protected \
  -H "Authorization: Bearer invalid-token"
```

**Response (401 Unauthorized):**
```json
{
  "errorName": "AuthenticationException",
  "errorCode": "AUTH_INVALID_TOKEN",
  "httpStatus": 401,
  "message": "Invalid authentication token",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/protected"
}
```

### Example 4: Database Duplicate Key Error

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"email": "existing@example.com", "name": "Test User"}'
```

**Response (409 Conflict):**
```json
{
  "errorName": "Error",
  "errorCode": "DB_DUPLICATE_KEY",
  "httpStatus": 409,
  "message": "A resource with this value already exists",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users",
  "details": {
    "duplicateFields": ["email"]
  }
}
```

### Example 5: Rate Limit Error

**Request:**
```bash
# After exceeding rate limit
curl -X POST http://localhost:8000/api/v1/login
```

**Response (429 Too Many Requests):**
```json
{
  "errorName": "Error",
  "errorCode": "RATE_429",
  "httpStatus": 429,
  "message": "Too many requests. Please try again later",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/login"
}
```

### Example 6: Internal Server Error

**Request:**
```bash
curl -X GET http://localhost:8000/api/v1/users
```

**Response (500 Internal Server Error):**
```json
{
  "errorName": "InternalServerException",
  "errorCode": "SRV_500",
  "httpStatus": 500,
  "message": "An internal server error occurred. Please try again later",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users"
}
```

### Example 7: 404 Not Found (Route)

**Request:**
```bash
curl -X GET http://localhost:8000/api/v1/nonexistent
```

**Response (404 Not Found):**
```json
{
  "errorName": "NotFoundError",
  "errorCode": "USR_404",
  "httpStatus": 404,
  "message": "The requested endpoint GET /api/v1/nonexistent was not found",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/nonexistent"
}
```

## Best Practices

1. **Always use asyncHandler** for async route handlers:
   ```typescript
   app.get("/users", asyncHandler(async (req, res) => {
     // Your code here
   }));
   ```

2. **Throw appropriate error classes** instead of generic errors:
   ```typescript
   // Good
   throw new NotFoundException("User not found");
   
   // Bad
   throw new Error("User not found");
   ```

3. **Provide meaningful error messages** that help users understand what went wrong:
   ```typescript
   // Good
   throw new ValidationException("Email address is required");
   
   // Bad
   throw new ValidationException("Error");
   ```

4. **Include details for validation errors**:
   ```typescript
   throw new ValidationException("Validation failed", ErrorCodeEnum.VAL_400, {
     fields: ["email", "password"],
     errors: ["Email is required", "Password must be at least 8 characters"],
   });
   ```

5. **Don't expose sensitive information** in error messages:
   ```typescript
   // Good
   throw new UnauthorizedException("Invalid credentials");
   
   // Bad
   throw new UnauthorizedException(`User ${email} not found with password ${password}`);
   ```

## Testing Error Responses

### Unit Test Example

```typescript
import { BadRequestException } from "./common/utils/app-error";
import { ErrorCodeEnum } from "./common/enums/error-code.enum";

describe("Error Handling", () => {
  it("should create BadRequestException with correct properties", () => {
    const error = new BadRequestException("Invalid input");
    
    expect(error.message).toBe("Invalid input");
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe(ErrorCodeEnum.USR_400);
    expect(error.isOperational).toBe(true);
  });
});
```

### Integration Test Example

```typescript
import request from "supertest";
import app from "./index";

describe("Error Handling Integration", () => {
  it("should return 404 for non-existent route", async () => {
    const response = await request(app)
      .get("/api/v1/nonexistent")
      .expect(404);
    
    expect(response.body).toMatchObject({
      errorName: "NotFoundError",
      errorCode: "USR_404",
      httpStatus: 404,
    });
  });
  
  it("should return 400 for invalid JSON", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send("invalid json")
      .set("Content-Type", "application/json")
      .expect(400);
    
    expect(response.body.errorCode).toBeDefined();
  });
});
```

## Security Considerations

1. **No stack traces in production** - Stack traces are only included in development mode
2. **No sensitive data in error messages** - Error messages are user-friendly and don't expose internals
3. **Structured logging** - Full error details are logged server-side for debugging
4. **Rate limiting** - Built-in support for rate limit error handling
5. **Input validation** - Validation errors are caught and returned with clear messages

## Troubleshooting

### Errors not being caught

Ensure:
1. Routes use `asyncHandler` wrapper
2. Error handler middleware is added **after** all routes
3. 404 handler is added **before** error handler

### Logs not appearing

Check:
1. `logs/` directory exists and is writable
2. Winston configuration in `src/common/utils/logger.ts`
3. Environment variables are set correctly

### Error responses not consistent

Verify:
1. All errors extend `AppError` class
2. Error handler middleware is properly configured
3. No custom error handling in routes bypassing the middleware

