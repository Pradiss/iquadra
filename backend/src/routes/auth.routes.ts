import { Router } from "express";

import {
  loginController,
  registerAcademiaController,
  registerClienteController,
  registerProfessorController,
} from "../controllers/auth.controller";
import { authRateLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

router.post("/auth/register/cliente", authRateLimiter, registerClienteController);
router.post("/auth/register/professor", authRateLimiter, registerProfessorController);
router.post("/auth/register/academia", authRateLimiter, registerAcademiaController);
router.post("/auth/login", authRateLimiter, loginController);

export default router;
