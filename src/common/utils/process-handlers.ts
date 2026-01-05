import { Env } from "../../configs/env.config";
import { logError, logger } from "./logger";

/**
 * Handle unhandled promise rejections
 * This catches errors from async operations that weren't properly handled
 */
export const handleUnhandledRejection = (): void => {
	process.on(
		"unhandledRejection",
		(reason: unknown, promise: Promise<unknown>) => {
			const error =
				reason instanceof Error
					? reason
					: new Error(String(reason) || "Unhandled Promise Rejection");

			logError(error, { method: "PROCESS", url: "unhandledRejection" });

			logger.error("Unhandled Promise Rejection", {
				reason,
				promise,
				stack: error.stack,
			});

			// In production, we might want to exit the process
			// In development, we can continue for debugging
			if (Env.NODE_ENV === "production") {
				// Give time for logs to be written
				setTimeout(() => {
					logger.error("Exiting process due to unhandled rejection");
					process.exit(1);
				}, 1000);
			}
		},
	);
};

/**
 * Handle uncaught exceptions
 * This catches synchronous errors that weren't caught
 */
export const handleUncaughtException = (): void => {
	process.on("uncaughtException", (error: Error) => {
		logError(error, { method: "PROCESS", url: "uncaughtException" });

		logger.error("Uncaught Exception", {
			error: error.message,
			stack: error.stack,
		});

		// Uncaught exceptions are critical - exit the process
		logger.error("Exiting process due to uncaught exception");
		process.exit(1);
	});
};

/**
 * Handle SIGTERM signal (graceful shutdown)
 */
export const handleSIGTERM = (): void => {
	process.on("SIGTERM", () => {
		logger.info("SIGTERM signal received: closing HTTP server");
		// Close server gracefully
		process.exit(0);
	});
};

/**
 * Handle SIGINT signal (Ctrl+C)
 */
export const handleSIGINT = (): void => {
	process.on("SIGINT", () => {
		logger.info("SIGINT signal received: closing HTTP server");
		// Close server gracefully
		process.exit(0);
	});
};

/**
 * Initialize all process-level error handlers
 */
export const initializeProcessHandlers = (): void => {
	handleUnhandledRejection();
	handleUncaughtException();
	handleSIGTERM();
	handleSIGINT();

	logger.info("Process-level error handlers initialized");
};
