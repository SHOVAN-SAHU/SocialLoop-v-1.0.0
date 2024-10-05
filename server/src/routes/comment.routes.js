import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

//Verified routes...

router.route("/:_id/add").post(verifyJWT, addComment); //:_id = postID
router.route("/:_id/delete").delete(verifyJWT, deleteComment); //:_id commentID

export default router;
