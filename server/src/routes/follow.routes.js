import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { followOrUnfollowUser } from "../controllers/follow.controller.js";

const router = Router();

//Verified routes...
router.route("/:_id/follow-unfollow").get(verifyJWT, followOrUnfollowUser);

export default router;
