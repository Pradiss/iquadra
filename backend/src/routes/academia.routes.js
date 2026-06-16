"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const academia_controller_1 = require("../controllers/academia.controller");
const router = (0, express_1.Router)();
router.get("/academias", academia_controller_1.listAcademiasController);
router.get("/academias/:id", academia_controller_1.getAcademiaController);
router.post("/academias", academia_controller_1.createAcademiaController);
exports.default = router;
//# sourceMappingURL=academia.routes.js.map