import { Router } from "express";

import {
  adicionarParticipanteJogoController,
  cancelarJogoController,
  createJogoController,
  getJogoController,
  listJogosController,
  participarJogoController,
  removerParticipanteJogoController,
  sairJogoController,
} from "../controllers/jogo.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/jogos", authMiddleware, listJogosController);
router.get("/jogos/:id", authMiddleware, getJogoController);

router.post("/jogos", authMiddleware, createJogoController);
router.post("/jogos/:id/participar", authMiddleware, participarJogoController);
router.post(
  "/jogos/:id/participantes",
  authMiddleware,
  adicionarParticipanteJogoController
);
router.delete("/jogos/:id/participar", authMiddleware, sairJogoController);
router.delete(
  "/jogos/:id/participantes/:usuarioId",
  authMiddleware,
  removerParticipanteJogoController
);
router.patch("/jogos/:id/cancelar", authMiddleware, cancelarJogoController);

export default router;
