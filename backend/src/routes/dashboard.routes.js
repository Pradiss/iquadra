"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/dashboard/academias/:academiaId", auth_middleware_1.authMiddleware, dashboard_controller_1.getDashboardAcademiaController);
router.get("/dashboard/academias/:academiaId/agenda", auth_middleware_1.authMiddleware, dashboard_controller_1.getAgendaAcademiaController);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map