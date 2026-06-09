import { Router } from "express";

import {
  cancelarJogoController,
  createJogoController,
  getJogoController,
  listJogosController,
  participarJogoController,
  sairJogoController,
} from "../controllers/jogo.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/jogos", listJogosController);
router.get("/jogos/:id", getJogoController);

router.post("/jogos", authMiddleware, createJogoController);
router.post("/jogos/:id/participar", authMiddleware, participarJogoController);
router.delete("/jogos/:id/participar", authMiddleware, sairJogoController);
router.patch("/jogos/:id/cancelar", authMiddleware, cancelarJogoController);

export default router;