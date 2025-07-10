import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/expense-tracker`);
    console.log(`MongoDB connected successfully!`);
  } catch (error) {
    console.log(`Mongodb connection error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
