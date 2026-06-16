"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const amizade_controller_1 = require("../controllers/amizade.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/amizades", auth_middleware_1.authMiddleware, amizade_controller_1.listarAmizadesController);
router.post("/amizades", auth_middleware_1.authMiddleware, amizade_controller_1.solicitarAmizadeController);
router.patch("/amizades/:id/aceitar", auth_middleware_1.authMiddleware, amizade_controller_1.aceitarAmizadeController);
router.patch("/amizades/:id/recusar", auth_middleware_1.authMiddleware, amizade_controller_1.recusarAmizadeController);
router.delete("/amizades/:id", auth_middleware_1.authMiddleware, amizade_controller_1.removerAmizadeController);
exports.default = router;
//# sourceMappingURL=amizades.routes.js.map