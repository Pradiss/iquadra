import { Router } from "express";

import {
  getDisponibilidadeAcademiaController,
  getDisponibilidadeQuadraController,
} from "../controllers/disponibilidade.controller";
import { optionalAuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/academias/:academiaId/disponibilidade",
  optionalAuthMiddleware,
  getDisponibilidadeAcademiaController
);

router.get(
  "/quadras/:id/disponibilidade",
  optionalAuthMiddleware,
  getDisponibilidadeQuadraController
);

export default router;
