"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const disponibilidade_controller_1 = require("../controllers/disponibilidade.controller");
const router = (0, express_1.Router)();
router.get("/quadras/:id/disponibilidade", disponibilidade_controller_1.getDisponibilidadeQuadraController);
exports.default = router;
//# sourceMappingURL=disponibilidade.routes.js.map