import { Router } from "express";

import {
  cancelarAulaController,
  createAulaController,
  getAulaController,
  listAulasController,
} from "../controllers/aula.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/aulas", listAulasController);
router.get("/aulas/:id", getAulaController);

router.post("/aulas", authMiddleware, createAulaController);
router.patch("/aulas/:id/cancelar", authMiddleware, cancelarAulaController);

export default router;