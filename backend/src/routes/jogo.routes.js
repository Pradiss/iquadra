"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jogo_controller_1 = require("../controllers/jogo.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/jogos", jogo_controller_1.listJogosController);
router.get("/jogos/:id", jogo_controller_1.getJogoController);
router.post("/jogos", auth_middleware_1.authMiddleware, jogo_controller_1.createJogoController);
router.post("/jogos/:id/participar", auth_middleware_1.authMiddleware, jogo_controller_1.participarJogoController);
router.delete("/jogos/:id/participar", auth_middleware_1.authMiddleware, jogo_controller_1.sairJogoController);
router.patch("/jogos/:id/cancelar", auth_middleware_1.authMiddleware, jogo_controller_1.cancelarJogoController);
exports.default = router;
//# sourceMappingURL=jogo.routes.js.map