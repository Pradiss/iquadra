import { Router } from "express";

import {
  buscarAcademiaPublicaController,
  buscarDisponibilidadePublicaController,
  listarAcademiasPublicasController,
} from "../controllers/public-agenda.controller";

const router = Router();

router.get("/public/academias", listarAcademiasPublicasController);
router.get("/public/academias/:slug", buscarAcademiaPublicaController);
router.get(
  "/public/academias/:slug/disponibilidade",
  buscarDisponibilidadePublicaController,
);

export default router;