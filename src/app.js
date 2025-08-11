import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

const app = express();

dotenv.config({
  path: "./.env",
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(cors());

app.use("/api/v1/auth", authRouter);

export default app;
