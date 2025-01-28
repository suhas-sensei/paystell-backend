import express from "express";
import morgan from "morgan";
import cors from "cors";
import emailVerification from "./routes/emailVerification.routes";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use("/email-verification", emailVerification);
export default app;
