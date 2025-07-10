import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const app = express();

dotenv.config({
  path: "./.env",
});

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cors);

export default app;
