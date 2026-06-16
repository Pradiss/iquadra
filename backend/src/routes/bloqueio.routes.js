"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bloqueio_controller_1 = require("../controllers/bloqueio.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/quadras/:quadraId/bloqueios", bloqueio_controller_1.listBloqueiosController);
router.post("/quadras/:quadraId/bloqueios", auth_middleware_1.authMiddleware, bloqueio_controller_1.createBloqueioController);
router.delete("/bloqueios/:id", auth_middleware_1.authMiddleware, bloqueio_controller_1.deleteBloqueioController);
exports.default = router;
//# sourceMappingURL=bloqueio.routes.js.map