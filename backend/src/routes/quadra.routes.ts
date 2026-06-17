import { Router } from "express";

import {
  createQuadraController,
  deleteQuadraController,
  getQuadraController,
  listQuadrasController,
  updateQuadraController,
  updateStatusQuadraController,
} from "../controllers/quadra.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/academias/:academiaId/quadras", listQuadrasController);
router.post("/academias/:academiaId/quadras", authMiddleware, createQuadraController);

router.get("/quadras/:id", getQuadraController);
router.put("/quadras/:id", authMiddleware, updateQuadraController);
router.patch("/quadras/:id/status", authMiddleware, updateStatusQuadraController);
router.delete("/quadras/:id", authMiddleware, deleteQuadraController);

export default router;
