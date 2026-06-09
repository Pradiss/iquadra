import { Router } from "express";

import { getDisponibilidadeQuadraController } from "../controllers/disponibilidade.controller";

const router = Router();

router.get("/quadras/:id/disponibilidade", getDisponibilidadeQuadraController);

export default router;