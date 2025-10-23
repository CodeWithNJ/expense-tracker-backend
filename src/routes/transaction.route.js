import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
  viewAllTransactions,
} from "../controllers/transaction.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const transactionRouter = Router();

transactionRouter.route("/").post(verifyJwt, createTransaction);
transactionRouter.route("/all").get(verifyJwt, viewAllTransactions);
transactionRouter.route("/:id").patch(verifyJwt, updateTransaction);
transactionRouter.route("/:id").delete(verifyJwt, deleteTransaction);

export default transactionRouter;
