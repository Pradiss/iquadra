"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quadra_controller_1 = require("../controllers/quadra.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/academias/:academiaId/quadras", quadra_controller_1.listQuadrasController);
router.post("/academias/:academiaId/quadras", auth_middleware_1.authMiddleware, quadra_controller_1.createQuadraController);
router.get("/quadras/:id", quadra_controller_1.getQuadraController);
router.put("/quadras/:id", auth_middleware_1.authMiddleware, quadra_controller_1.updateQuadraController);
router.patch("/quadras/:id/status", auth_middleware_1.authMiddleware, quadra_controller_1.updateStatusQuadraController);
exports.default = router;
//# sourceMappingURL=quadra.routes.js.map