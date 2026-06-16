import { Router } from "express";

import {
  getAcademiaController,
  listAcademiasController,
} from "../controllers/academia.controller";

const router = Router();

router.get("/academias", listAcademiasController);
router.get("/academias/:id", getAcademiaController);

export default router;
