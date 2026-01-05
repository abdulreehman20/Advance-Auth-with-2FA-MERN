import { HTTPSTATUS } from "../configs/http.config";
import type { Request, Response, NextFunction } from "express";
import { ErrorCodeEnum } from "../common/enums/error-code.enum";

/**
 * 404 Not Found Handler Middleware
 * Handles requests to non-existent routes
 */
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
	res.status(HTTPSTATUS.NOT_FOUND).json({
		errorName: "NotFoundError",
		errorCode: ErrorCodeEnum.USR_404,
		httpStatus: HTTPSTATUS.NOT_FOUND,
		message: `The requested endpoint ${req.method} ${req.originalUrl} was not found`,
		timestamp: new Date().toISOString(),
		path: req.originalUrl,
	});
};

