import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Env } from "../../configs/env.config";

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

// Custom format for console output
const consoleFormat = printf((info: winston.Logform.TransformableInfo) => {
	const { level, message, timestamp, stack, ...meta } = info;
	let log = `${timestamp} [${level}]: ${message}`;

	if (stack) {
		log += `\n${stack}`;
	}

	if (Object.keys(meta).length > 0) {
		log += `\n${JSON.stringify(meta, null, 2)}`;
	}

	return log;
});

// Create transports array
const transports: winston.transport[] = [
	// Console transport with colors in development
	new winston.transports.Console({
		format: combine(
			colorize(),
			timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
			errors({ stack: true }),
			consoleFormat,
		),
		level: Env.NODE_ENV === "production" ? "info" : "debug",
	}),
];

// Add file transports in production
if (Env.NODE_ENV === "production") {
	// Error log file
	transports.push(
		new DailyRotateFile({
			filename: "logs/error-%DATE%.log",
			datePattern: "YYYY-MM-DD",
			level: "error",
			format: combine(timestamp(), errors({ stack: true }), json()),
			maxSize: "20m",
			maxFiles: "14d",
		}),
	);

	// Combined log file
	transports.push(
		new DailyRotateFile({
			filename: "logs/combined-%DATE%.log",
			datePattern: "YYYY-MM-DD",
			format: combine(timestamp(), errors({ stack: true }), json()),
			maxSize: "20m",
			maxFiles: "14d",
		}),
	);
}

// Create logger instance
export const logger = winston.createLogger({
	level: Env.NODE_ENV === "production" ? "info" : "debug",
	format: combine(
		timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		errors({ stack: true }),
		json(),
	),
	defaultMeta: {
		service: "express-auth-api",
		environment: Env.NODE_ENV,
	},
	transports,
	// Don't exit on handled exceptions
	exitOnError: false,
});

// Helper function to log errors with request context
export const logError = (
	error: Error,
	req?: {
		method?: string;
		url?: string;
		ip?: string;
		headers?: Record<string, unknown>;
		body?: unknown;
		params?: unknown;
		query?: unknown;
	},
) => {
	const errorContext: Record<string, unknown> = {
		message: error.message,
		stack: error.stack,
		name: error.name,
	};

	if (req) {
		errorContext.request = {
			method: req.method,
			url: req.url,
			ip: req.ip,
			headers: req.headers,
			body: req.body,
			params: req.params,
			query: req.query,
		};
	}

	logger.error("Error occurred", errorContext);
};

// Helper function to log warnings
export const logWarning = (message: string, meta?: Record<string, unknown>) => {
	logger.warn(message, meta);
};

// Helper function to log info
export const logInfo = (message: string, meta?: Record<string, unknown>) => {
	logger.info(message, meta);
};

// Helper function to log debug
export const logDebug = (message: string, meta?: Record<string, unknown>) => {
	logger.debug(message, meta);
};
