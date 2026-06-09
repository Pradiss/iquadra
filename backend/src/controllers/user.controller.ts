import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";

export async function meController(
  req: AuthRequest,
  res: Response
) {
  return res.json({
    success: true,
    user: req.user,
  });
}