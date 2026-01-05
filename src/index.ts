import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Env } from "./configs/env.config";
import { HTTPSTATUS } from "./configs/http.config";
import { connectDatabase } from "./database/database";
import express, { type Request, type Response } from "express";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { errorHandler } from "./middlewares/errorHandler.middleware";

const app = express();
// const BASE_PATH = Env.BASE_PATH;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: Env.FRONTEND_ORIGIN, credentials: true }));


app.get("/", asyncHandler(async (_req: Request, res: Response) => {
	res
		.status(HTTPSTATUS.OK)
		.json({ message: "Welcome to the Express.js Authentication API", status: "OK" });
}),
);

app.get("/health", asyncHandler(async (_req: Request, res: Response) => {
	res
		.status(HTTPSTATUS.OK)
		.json({ message: "Server is healthy", status: "OK" });
}));

app.use(errorHandler);

app.listen(Env.PORT, async () => {
	await connectDatabase();
	console.log(`Server running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});
