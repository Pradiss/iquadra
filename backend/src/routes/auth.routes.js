"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post("/auth/register/cliente", auth_controller_1.registerClienteController);
router.post("/auth/register/professor", auth_controller_1.registerProfessorController);
router.post("/auth/register/academia", auth_controller_1.registerAcademiaController);
router.post("/auth/login", auth_controller_1.loginController);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map