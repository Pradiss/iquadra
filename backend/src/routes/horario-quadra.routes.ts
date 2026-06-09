import { Router } from "express";

import {
  createHorarioQuadraController,
  deleteHorarioQuadraController,
  listHorariosQuadraController,
  updateHorarioQuadraController,
} from "../controllers/horario-quadra.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/quadras/:quadraId/horarios", listHorariosQuadraController);

router.post(
  "/quadras/:quadraId/horarios",
  authMiddleware,
  createHorarioQuadraController
);

router.put(
  "/horarios-quadra/:id",
  authMiddleware,
  updateHorarioQuadraController
);

router.delete(
  "/horarios-quadra/:id",
  authMiddleware,
  deleteHorarioQuadraController
);

export default router;