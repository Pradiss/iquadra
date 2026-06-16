"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const horario_quadra_controller_1 = require("../controllers/horario-quadra.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/quadras/:quadraId/horarios", horario_quadra_controller_1.listHorariosQuadraController);
router.post("/quadras/:quadraId/horarios", auth_middleware_1.authMiddleware, horario_quadra_controller_1.createHorarioQuadraController);
router.put("/horarios-quadra/:id", auth_middleware_1.authMiddleware, horario_quadra_controller_1.updateHorarioQuadraController);
router.delete("/horarios-quadra/:id", auth_middleware_1.authMiddleware, horario_quadra_controller_1.deleteHorarioQuadraController);
exports.default = router;
//# sourceMappingURL=horario-quadra.routes.js.map