import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res, next) => {
  const { fullName, gender, dob, email, username, password } = req.body;

  if ([fullName, gender, dob, password].some((field) => !field)) {
    return res
      .status(400)
      .json(new ApiError(400, "Required fields are missing"));
  }

  let existingUser;

  if (username) {
    existingUser = await User.findOne({ username });
  } else {
    existingUser = await User.findOne({ email });
  }

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

  const newSavedUser = await newUser.save();

  const finalResponse = await User.findById(newSavedUser._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, finalResponse, "New user created successfully.")
    );
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  if ((!username && !password) || (!email && !password))
    return res
      .status(400)
      .json(new ApiError(400, "Required fields are missing."));

  let validUser;

  if (username) {
    validUser = await User.findOne({ username });
  } else {
    validUser = await User.findOne({ email });
  }

  if (!validUser)
    return res.status(404).json(new ApiError(404, "User not found."));

  const isPasswordCorrect = await validUser.isPasswordCorrect(password);

  if (!isPasswordCorrect)
    return res.status(401).json(new ApiError(401, "Incorrect Password."));

  const accessToken = await validUser.generateAccessToken();
  const refreshToken = await validUser.generateRefreshToken();

  const options = {
    httpOnly: true,
    secure: true,
  };

  validUser.refreshToken = refreshToken;
  await validUser.save();

  res.cookie("accessToken", accessToken, options);
  res.cookie("refreshToken", refreshToken, options);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { accessToken: accessToken },
        "User logged in successfully"
      )
    );
});

export const checkUserAuthenticated = asyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .json(new ApiResponse(200, null, "User is authenticated"));
});
