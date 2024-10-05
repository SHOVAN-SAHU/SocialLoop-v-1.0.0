import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  editProfile,
  getSuggestedUsers,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

//Verified routes...

router.route("/logout").get(verifyJWT, logoutUser);
router.route("/:_id/profile").get(verifyJWT, getUserProfile);
router
  .route("/edit-profile")
  .patch(verifyJWT, upload.single("profileImage"), editProfile);
router.route("/suggested-users").get(verifyJWT, getSuggestedUsers);

router.route("/delete").delete(verifyJWT, deleteUser);

export default router;
