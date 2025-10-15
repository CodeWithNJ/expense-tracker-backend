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

  const validTransaction = await Transaction.findById(transactionId);

  if (!validTransaction) {
    return res.status(404).json(new ApiError(404, "Transaction not found."));
  }

  const userDetails = await User.findById(validTransaction.userId);

  // Update title if provided
  if (title) validTransaction.title = title;

  // Store original values for calculations
  const originalAmount = validTransaction.amount;
  const originalType = validTransaction.transactionType;

  // Determine if amount or type is changing
  const isAmountChanging = amount && amount !== originalAmount;
  const isTypeChanging =
    transactionType &&
    transactionType.toLowerCase() !== originalType.toLowerCase();

  // Case 1: Both amount and transaction type are changing
  if (isAmountChanging && isTypeChanging) {
    if (transactionType.toLowerCase() === "income") {
      // Changing from expense to income with new amount
      userDetails.totalExpense -= originalAmount;
      userDetails.balance += originalAmount; // Reverse old expense impact
      userDetails.totalIncome += amount;
      userDetails.balance += amount; // Apply new income impact
    } else {
      // Changing from income to expense with new amount
      userDetails.totalIncome -= originalAmount;
      userDetails.balance -= originalAmount; // Reverse old income impact
      userDetails.totalExpense += amount;
      userDetails.balance -= amount; // Apply new expense impact
    }
    validTransaction.amount = amount;
    validTransaction.transactionType = transactionType;
  }
  // Case 2: Only transaction type is changing
  else if (isTypeChanging && !isAmountChanging) {
    if (transactionType.toLowerCase() === "income") {
      // Changing from expense to income (same amount)
      userDetails.totalExpense -= originalAmount;
      userDetails.totalIncome += originalAmount;
      userDetails.balance += 2 * originalAmount; // Reverse expense (-) and apply income (+)
    } else {
      // Changing from income to expense (same amount)
      userDetails.totalIncome -= originalAmount;
      userDetails.totalExpense += originalAmount;
      userDetails.balance -= 2 * originalAmount; // Reverse income (+) and apply expense (-)
    }
    validTransaction.transactionType = transactionType;
  }
  // Case 3: Only amount is changing (type stays the same or not provided)
  else if (isAmountChanging && !isTypeChanging) {
    const currentType = transactionType
      ? transactionType.toLowerCase()
      : originalType.toLowerCase();

    if (currentType === "income") {
      userDetails.totalIncome -= originalAmount;
      userDetails.balance -= originalAmount;
      userDetails.totalIncome += amount;
      userDetails.balance += amount;
    } else {
      userDetails.totalExpense -= originalAmount;
      userDetails.balance += originalAmount; // Reverse old expense
      userDetails.totalExpense += amount;
      userDetails.balance -= amount; // Apply new expense
    }
    validTransaction.amount = amount;

    // Update type if explicitly provided (even if same)
    if (transactionType) {
      validTransaction.transactionType = transactionType;
    }
  }
  // Case 4: Transaction type provided but same as original, no amount change
  else if (transactionType && !isTypeChanging && !isAmountChanging) {
    // No financial updates needed, just update the field for consistency
    validTransaction.transactionType = transactionType;
  }

  await validTransaction.save();
  await userDetails.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        validTransaction,
        "Transaction updated successfully."
      )
    );
});
