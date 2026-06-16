import { Router } from "express";

import {
  createBloqueioController,
  deleteBloqueioController,
  listBloqueiosController,
} from "../controllers/bloqueio.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/quadras/:quadraId/bloqueios", authMiddleware, listBloqueiosController);

router.post(
  "/quadras/:quadraId/bloqueios",
  authMiddleware,
  createBloqueioController
);

router.delete("/bloqueios/:id", authMiddleware, deleteBloqueioController);

export default router;
