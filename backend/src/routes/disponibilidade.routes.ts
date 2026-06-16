import { Router } from "express";

import { getDisponibilidadeQuadraController } from "../controllers/disponibilidade.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/quadras/:id/disponibilidade",
  authMiddleware,
  getDisponibilidadeQuadraController
);

export default router;
