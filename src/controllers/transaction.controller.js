import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTransaction = asyncHandler(async (req, res, next) => {
  const userDetails = await User.findById(req.user?._id);

  if (!userDetails) {
    return res.status(404).json(new ApiError(404, "User not found."));
  }

  const { title, amount, transactionType } = req.body;

  if ([title, amount, transactionType].some((field) => !field)) {
    return res
      .status(400)
      .json(new ApiError(400, "Required fields are missing"));
  }

  const lowerCaseTransactionType = transactionType.toLowerCase();

  if (
    lowerCaseTransactionType !== "income" &&
    lowerCaseTransactionType !== "expense"
  ) {
    return res.status(400).json(new ApiError(400, "Invalid transactionType"));
  }

  const newTransaction = await Transaction.create({
    userId: userDetails._id,
    title,
    amount,
    transactionType: lowerCaseTransactionType,
  });

  if (lowerCaseTransactionType === "income") {
    userDetails.totalIncome += amount;
    userDetails.balance += amount;
  } else {
    userDetails.totalExpense += amount;
    userDetails.balance -= amount;
  }

  const savedTransaction = await newTransaction.save();
  await userDetails.save();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        savedTransaction,
        "New transaction created successfully."
      )
    );
});

export const viewAllTransactions = asyncHandler(async (req, res, next) => {
  const userDetails = await User.findById(req.user?._id);

  if (!userDetails) {
    return res.status(404).json(new ApiError(404, "User not found."));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const pipeline = [
    { $match: { userId: userDetails._id } },
    { $sort: { amount: -1 } }, // Sort by amount descending.
  ];

  const aggregate = Transaction.aggregate(pipeline);

  const options = { page, limit };

  const results = await Transaction.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(
      new ApiResponse(200, results, "Fetched all transactions successfully.")
    );
});
