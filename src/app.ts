import express from "express";
import morgan from "morgan";
import cors from "cors";
import sessionRouter from "./routes/session.routes";
import { globalRateLimiter } from "./middlewares/globalRateLimiter.middleware";
import { startExpiredSessionCleanupCronJobs } from "./utils/schedular";
import emailVerification from "./routes/emailVerification.routes";
import PaymentRoute from './routes/ParymentLink.routes';
import authRoutes from './routes/authRoutes';
import RateLimitMonitoringService from "./services/rateLimitMonitoring.service";
import { validateIpAddress } from "./middlewares/ipValidation.middleware";
import { errorHandler } from "./middlewares/errorHandler";
import merchantWebhookQueueRoutes from "./routes/merchantWebhookQueue.routes";
import merchantWebhookRoutes from "./routes/webhook.routes";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(validateIpAddress);
app.use(RateLimitMonitoringService.createRateLimitMonitoringMiddleware());
app.use(globalRateLimiter);

startExpiredSessionCleanupCronJobs();

// Define routes
app.use("/session", sessionRouter);
app.use("/email-verification", emailVerification);
app.use("/paymentlink", PaymentRoute);
app.use('/auth', authRoutes);
app.use(errorHandler);
app.use("/webhook-queue/merchant", merchantWebhookQueueRoutes);
app.use("/webhook", merchantWebhookRoutes);

export default app;