import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addPost,
  getPostDetails,
  getRandomPost,
  deletePost,
  savedPosts,
} from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/:_id/details").get(verifyJWT, getPostDetails);
router.route("/random").get(verifyJWT, getRandomPost);

//Verified routes...

router.route("/add-post").post(verifyJWT, upload.single("image"), addPost);
router.route("/:_id/delete").delete(verifyJWT, deletePost);
router.route("/:_id/save").get(verifyJWT, savedPosts);

export default router;
