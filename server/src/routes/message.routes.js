import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { sendMessage, getMessage } from "../controllers/message.controller.js";

const router = Router();

//Verified routes...

router.route("/:_id/send").post(verifyJWT, sendMessage);
router.route("/:_id/get").get(verifyJWT, getMessage);

export default router;
