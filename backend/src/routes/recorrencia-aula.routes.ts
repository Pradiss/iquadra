import { Router } from "express";

import {
  cancelarRecorrenciaAulaController,
  createRecorrenciaAulaController,
  listRecorrenciasAulaController,
} from "../controllers/recorrencia-aula.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/aulas/recorrencias",
  authMiddleware,
  listRecorrenciasAulaController
);

router.post(
  "/aulas/recorrencias",
  authMiddleware,
  createRecorrenciaAulaController
);

router.patch(
  "/aulas/recorrencias/:id/cancelar",
  authMiddleware,
  cancelarRecorrenciaAulaController
);

export default router;
