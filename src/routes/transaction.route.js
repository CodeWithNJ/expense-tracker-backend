import { Router } from "express";
import {
  createTransaction,
  viewAllTransactions,
} from "../controllers/transaction.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const transactionRouter = Router();

transactionRouter.route("/").post(verifyJwt, createTransaction);
transactionRouter.route("/all").get(verifyJwt, viewAllTransactions);

export default transactionRouter;
