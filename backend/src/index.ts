import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import apiRouter from "./routes";
import { startCronJobs } from "./utils/cronJobs";
import cron from "node-cron";
import { prisma } from "./config/prisma";

const app = express();

app.use(helmet());
app.use(
	cors({
		origin: env.clientUrl,
		credentials: true
	})
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 500,
		standardHeaders: true,
		legacyHeaders: false
	})
);

app.use("/api", apiRouter);

app.use(errorHandler);



startCronJobs();


cron.schedule('*/4 * * * *', async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('Neon keepalive ✓')
  } catch (e) {
    console.error('Keepalive failed:', e)
  }
})

app.get("/health", (_req, res) => {
	res.status(200).json({ status: "ok" });
});

app.listen(env.port, () => {
	// eslint-disable-next-line no-console
	console.log(`Server running on port ${env.port}`);
});
