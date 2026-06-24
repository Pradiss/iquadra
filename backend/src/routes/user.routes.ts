import { Router } from "express";
import multer from "multer";

import { env } from "../config/env";
import {
  removeAvatarController,
  uploadAvatarController,
} from "../controllers/avatar.controller";
import {
  listUsersController,
  meController,
  updateMeController,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ALLOWED_AVATAR_MIME_TYPES } from "../services/avatar-storage.service";

const router = Router();
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.AVATAR_MAX_BYTES,
  },
  fileFilter(_req, file, callback) {
    if (ALLOWED_AVATAR_MIME_TYPES.some((mime) => mime === file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(new Error("Formato de imagem invalido"), false);
  },
});

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

router.post(
  "/users/me/avatar",
  authMiddleware,
  avatarUpload.single("avatar"),
  uploadAvatarController
);

router.delete(
  "/users/me/avatar",
  authMiddleware,
  removeAvatarController
);

export default router;
