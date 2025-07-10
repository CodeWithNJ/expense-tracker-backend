import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "fullName is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "Female", "Others"],
        message: "Invalid gender",
      },
    },
    dob: {
      type: Date,
      min: "1900-01-01",
      max: Date.now(),
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
