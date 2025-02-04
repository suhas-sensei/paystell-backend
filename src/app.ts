import express from "express";
import morgan from "morgan";
import cors from "cors";
import sessionRouter from "./routes/session.routes";
import { globalRateLimiter } from "./middlewares/globalRateLimiter.middleware";
import { startExpiredSessionCleanupCronJobs } from "./utils/schedular";
import emailVerification from "./routes/emailVerification.routes";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(globalRateLimiter);
startExpiredSessionCleanupCronJobs();
app.use("/session", sessionRouter);
app.use("/email-verification", emailVerification);

export default app;
