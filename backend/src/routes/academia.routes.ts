import { Router } from "express";
import multer from "multer";

import {
  getAcademiaController,
  listAcademiasController,
  updateAcademiaController,
  uploadAcademiaLogoController,
} from "../controllers/academia.controller";
import { env } from "../config/env";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ALLOWED_AVATAR_MIME_TYPES } from "../services/avatar-storage.service";

const router = Router();
const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.AVATAR_MAX_BYTES,
  },
  fileFilter(_req, file, callback) {
    if (ALLOWED_AVATAR_MIME_TYPES.some((mime) => mime === file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(new Error("Formato de imagem invalido"));
  },
});

router.get("/academias", listAcademiasController);
router.get("/academias/:id", getAcademiaController);
router.put(
  "/academias/:id",
  authMiddleware,
  updateAcademiaController
);
router.post(
  "/academias/:id/logo",
  authMiddleware,
  logoUpload.single("logo"),
  uploadAcademiaLogoController
);

export default router;
