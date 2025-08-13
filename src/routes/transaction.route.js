import { Router } from "express";
import { createTransaction } from "../controllers/transaction.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const transactionRouter = Router();

transactionRouter.route("/").post(verifyJwt, createTransaction);

export default transactionRouter;
