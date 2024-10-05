import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    // req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({
        success: false,
        message: "Unauthorized request !!!",
        unauthorized: true,
      });

    const decodedToken = jwt.verify(token, process.env.TOKEN_PRIVATE_KEY);
    if (!decodedToken)
      return res.status(401).json({
        success: false,
        message: "Token not valid",
      });

    const user = await User.findById(decodedToken?._id).select("-password");
    if (!user)
      return res.status(401).json({
        success: false,
        message: "Invalid access Token",
      });

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
  }
};

export { verifyJWT };
