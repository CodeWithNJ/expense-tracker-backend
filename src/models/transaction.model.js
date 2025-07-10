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
      type: Double,
      default: 0,
      min: [0, "amount cannot be less than zero"],
      max: [100000, "amount cannot exceed 100000"],
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
