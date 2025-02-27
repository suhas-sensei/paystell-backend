import express from "express";
import morgan from "morgan";
import cors from "cors";
import sessionRouter from "./routes/session.routes";
import { globalRateLimiter } from "./middlewares/globalRateLimiter.middleware";
import { startExpiredSessionCleanupCronJobs } from "./utils/schedular";
import emailVerification from "./routes/emailVerification.routes";
import PaymentRoute from './routes/ParymentLink.routes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes'; 

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(globalRateLimiter);
startExpiredSessionCleanupCronJobs();

app.use("/session", sessionRouter);
app.use("/email-verification", emailVerification);
app.use("/paymentlink", PaymentRoute);
app.use('/auth', authRoutes);
app.use("/users", userRoutes);  

export default app;
