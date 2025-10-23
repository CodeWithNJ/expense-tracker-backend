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
    userDetails.totalIncome += Number(amount);
    userDetails.balance += Number(amount);
  } else {
    userDetails.totalExpense += Number(amount);
    userDetails.balance -= Number(amount);
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

export const updateTransaction = asyncHandler(async (req, res, next) => {
  const transactionId = req.params.id;
  const { title, amount, transactionType } = req.body;

  // Find transaction and user
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    return res.status(404).json(new ApiError(404, "Transaction not found."));
  }

  const user = await User.findById(transaction.userId);

  // Store original values
  const originalAmount = transaction.amount;
  const originalType = transaction.transactionType;

  // Get new values (use original if not provided)
  const newAmount = amount !== undefined ? amount : originalAmount;
  const newType = transactionType
    ? transactionType.toLowerCase()
    : originalType;

  // Validate new transaction type
  if (newType !== "income" && newType !== "expense") {
    return res.status(400).json(new ApiError(400, "Invalid transactionType"));
  }

  // STEP 1: Reverse original transaction impact
  if (originalType === "income") {
    user.totalIncome -= originalAmount;
    user.balance -= originalAmount;
  } else {
    user.totalExpense -= originalAmount;
    user.balance += originalAmount; // Reverse expense (add back)
  }

  // STEP 2: Apply new transaction impact
  if (newType === "income") {
    user.totalIncome += newAmount;
    user.balance += newAmount;
  } else {
    user.totalExpense += newAmount;
    user.balance -= newAmount;
  }

  // STEP 3: Update transaction fields
  if (title) transaction.title = title;
  transaction.amount = newAmount;
  transaction.transactionType = newType;

  // Save changes
  await transaction.save();
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, transaction, "Transaction updated successfully.")
    );
});
