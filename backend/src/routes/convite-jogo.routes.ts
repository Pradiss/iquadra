import { Router } from "express";

import {
  aceitarConviteJogoController,
  convidarJogadorController,
  listarConvitesJogosController,
  recusarConviteJogoController,
} from "../controllers/convite-jogo.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/jogos/:id/convidar", authMiddleware, convidarJogadorController);

router.get("/convites-jogos", authMiddleware, listarConvitesJogosController);

router.patch(
  "/convites-jogos/:id/aceitar",
  authMiddleware,
  aceitarConviteJogoController
);

router.patch(
  "/convites-jogos/:id/recusar",
  authMiddleware,
  recusarConviteJogoController
);

export default router;