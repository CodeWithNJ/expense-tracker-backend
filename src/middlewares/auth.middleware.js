import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  // Retrieve access token from the cookies generated during signin.
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  // Access token not found for the user.
  if (!token) {
    return res.status(401).json(new ApiError(401, "Unauthorized User"));
  }

  // Check validity of the token
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id);

  // user not found
  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found."));
  }

  req.user = user;
  next();
});
