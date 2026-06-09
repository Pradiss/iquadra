import { Router } from "express";

import {
  getAgendaAcademiaController,
  getDashboardAcademiaController,
} from "../controllers/dashboard.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/dashboard/academias/:academiaId",
  authMiddleware,
  getDashboardAcademiaController
);

router.get(
  "/dashboard/academias/:academiaId/agenda",
  authMiddleware,
  getAgendaAcademiaController
);

export default router;