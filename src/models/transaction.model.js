import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      default: 0,
      min: [1, "amount cannot be less than 1"],
      required: true,
    },
    transactionType: {
      type: String,
      enum: {
        values: ["income", "expense"],
        message: "Invalid transactionType",
      },
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
