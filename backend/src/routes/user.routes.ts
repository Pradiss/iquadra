import { Router } from "express";

import {
  listUsersController,
  meController,
  updateMeController,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/users",
  authMiddleware,
  listUsersController
);

router.get(
  "/users/me",
  authMiddleware,
  meController
);

router.put(
  "/users/me",
  authMiddleware,
  updateMeController
);

export default router;
