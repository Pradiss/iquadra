"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recorrencia_aula_controller_1 = require("../controllers/recorrencia-aula.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/aulas/recorrencias", recorrencia_aula_controller_1.listRecorrenciasAulaController);
router.post("/aulas/recorrencias", auth_middleware_1.authMiddleware, recorrencia_aula_controller_1.createRecorrenciaAulaController);
router.patch("/aulas/recorrencias/:id/cancelar", auth_middleware_1.authMiddleware, recorrencia_aula_controller_1.cancelarRecorrenciaAulaController);
exports.default = router;
//# sourceMappingURL=recorrencia-aula.routes.js.map