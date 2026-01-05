import type { ErrorRequestHandler } from "express";
import { HTTPSTATUS } from "../configs/http.config";
import { AppError, ErrorCodes } from "../common/utils/app-error";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
	console.error(`Error occurred: ${req.path}`, err);

	if (err instanceof AppError) {
		return res.status(err.statusCode).json({ message: err.message, errorCode: err.errorCode});
	}
	
	if (err instanceof SyntaxError) {
		return res.status(HTTPSTATUS.BAD_REQUEST).json({ message: err.message, errorCode: ErrorCodes.ERR_BAD_REQUEST});
	}

	return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
		message: "Internal Server Error",
		error: err.message || "Something went wrong",
		errorCode: ErrorCodes.ERR_INTERNAL,
	});
};
