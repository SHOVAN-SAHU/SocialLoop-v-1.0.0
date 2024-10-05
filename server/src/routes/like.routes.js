import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { likeOrUnlikePost } from "../controllers/like.controller.js";

const router = Router();

//Verified routes...

router.route("/:_id/like-unlike").get(verifyJWT, likeOrUnlikePost);

export default router;
