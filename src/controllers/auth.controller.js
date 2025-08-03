import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res, next) => {
  const { fullName, gender, dob, email, username, password } = req.body;

  if ([fullName, gender, dob, password].some((field) => !field)) {
    return res
      .status(400)
      .json(new ApiError(400, "Requierd fields are missing"));
  }

  // Check if user already exists.
  const existingUser = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (existingUser) {
    return res.status(409).json(new ApiError(409, "User already exists."));
  }

  const newUser = await User.create({
    fullName: fullName,
    gender: gender,
    dob: dob,
    email: email ? email : null,
    username: username ? username : null,
    password: password,
  });

  await newUser.save();

  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "New user created successfully."));
});
