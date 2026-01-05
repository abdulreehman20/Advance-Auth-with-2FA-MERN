import { Env } from "../../configs/env.config";

/**
 * Handle unhandled promise rejections
 * This catches errors from async operations that weren't properly handled
 */
export const handleUnhandledRejection = (): void => {
	process.on("unhandledRejection", (_reason: unknown, _promise: Promise<unknown>) => {
		if (Env.NODE_ENV === "production") {
			setTimeout(() => { process.exit(1) }, 1000);
		}
	});
};

/**
 * Handle uncaught exceptions
 * This catches synchronous errors that weren't caught
 */
export const handleUncaughtException = (): void => {
	// Uncaught exceptions are critical - exit the process
	process.on("uncaughtException", (_error: Error) => { process.exit(1) });
};

/**
 * Handle SIGTERM signal (graceful shutdown)
 */
export const handleSIGTERM = (): void => {
	// Close server gracefully
	process.on("SIGTERM", () => { process.exit(0) });
};

/**
 * Handle SIGINT signal (Ctrl+C)
 */
export const handleSIGINT = (): void => {
	// Close server gracefully
	process.on("SIGINT", () => { process.exit(0) });
};

/**
 * Initialize all process-level error handlers
 */
export const initializeProcessHandlers = (): void => {
	handleUnhandledRejection();
	handleUncaughtException();
	handleSIGTERM();
	handleSIGINT();
};
