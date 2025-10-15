import { Router } from "express";
import {
  createTransaction,
  updateTransaction,
  viewAllTransactions,
} from "../controllers/transaction.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const transactionRouter = Router();

transactionRouter.route("/").post(verifyJwt, createTransaction);
transactionRouter.route("/all").get(verifyJwt, viewAllTransactions);
transactionRouter.route("/:id").patch(verifyJwt, updateTransaction);

export default transactionRouter;
