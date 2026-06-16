import { Router } from "express";

import {
  cancelarAulaController,
  createAulaController,
  getAulaController,
  listAulasController,
} from "../controllers/aula.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/aulas", authMiddleware, listAulasController);
router.get("/aulas/:id", authMiddleware, getAulaController);

router.post("/aulas", authMiddleware, createAulaController);
router.patch("/aulas/:id/cancelar", authMiddleware, cancelarAulaController);

export default router;
