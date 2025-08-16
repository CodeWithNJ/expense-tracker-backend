import { Router } from "express";
import {
  checkUserAuthenticated,
  loginUser,
  registerUser,
} from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.route("/register").post(registerUser);
authRouter.route("/login").post(loginUser);
authRouter.route("/check-auth").get(verifyJwt, checkUserAuthenticated);

export default authRouter;
