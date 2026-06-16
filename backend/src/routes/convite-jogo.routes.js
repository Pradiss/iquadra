"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const convite_jogo_controller_1 = require("../controllers/convite-jogo.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/jogos/:id/convidar", auth_middleware_1.authMiddleware, convite_jogo_controller_1.convidarJogadorController);
router.get("/convites-jogos", auth_middleware_1.authMiddleware, convite_jogo_controller_1.listarConvitesJogosController);
router.patch("/convites-jogos/:id/aceitar", auth_middleware_1.authMiddleware, convite_jogo_controller_1.aceitarConviteJogoController);
router.patch("/convites-jogos/:id/recusar", auth_middleware_1.authMiddleware, convite_jogo_controller_1.recusarConviteJogoController);
exports.default = router;
//# sourceMappingURL=convite-jogo.routes.js.map