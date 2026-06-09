import { Router } from "express";

import {
  loginController,
  registerAcademiaController,
  registerClienteController,
  registerProfessorController,
} from "../controllers/auth.controller";

const router = Router();

router.post("/auth/register/cliente", registerClienteController);
router.post("/auth/register/professor", registerProfessorController);
router.post("/auth/register/academia", registerAcademiaController);
router.post("/auth/login", loginController);

export default router;