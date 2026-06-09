import { Router } from "express";

import {
  aceitarAmizadeController,
  listarAmizadesController,
  recusarAmizadeController,
  removerAmizadeController,
  solicitarAmizadeController,
} from "../controllers/amizade.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/amizades", authMiddleware, listarAmizadesController);
router.post("/amizades", authMiddleware, solicitarAmizadeController);
router.patch("/amizades/:id/aceitar", authMiddleware, aceitarAmizadeController);
router.patch("/amizades/:id/recusar", authMiddleware, recusarAmizadeController);
router.delete("/amizades/:id", authMiddleware, removerAmizadeController);

export default router;