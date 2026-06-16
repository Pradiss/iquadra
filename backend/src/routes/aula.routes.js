"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aula_controller_1 = require("../controllers/aula.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/aulas", aula_controller_1.listAulasController);
router.get("/aulas/:id", aula_controller_1.getAulaController);
router.post("/aulas", auth_middleware_1.authMiddleware, aula_controller_1.createAulaController);
router.patch("/aulas/:id/cancelar", auth_middleware_1.authMiddleware, aula_controller_1.cancelarAulaController);
exports.default = router;
//# sourceMappingURL=aula.routes.js.map