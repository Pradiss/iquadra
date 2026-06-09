import { Router } from "express";

import { meController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/users/me",
  authMiddleware,
  meController
);

export default router;