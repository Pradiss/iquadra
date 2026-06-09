import { Router } from "express";

import {
  createAcademiaController,
  getAcademiaController,
  listAcademiasController,
} from "../controllers/academia.controller";

const router = Router();

router.get("/academias", listAcademiasController);
router.get("/academias/:id", getAcademiaController);
router.post("/academias", createAcademiaController);

export default router;