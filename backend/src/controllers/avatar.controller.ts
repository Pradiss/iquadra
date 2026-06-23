import type { Response } from "express";

import type { AuthRequest } from "../middlewares/auth.middleware";
import {
  removeAvatar,
  uploadAvatar,
  type AvatarFile,
} from "../services/avatar-storage.service";

export async function uploadAvatarController(req: AuthRequest, res: Response) {
  const usuario = await uploadAvatar(
    req.user!.id,
    req.user!.supabaseUserId,
    req.file as AvatarFile | undefined
  );

  return res.json({
    success: true,
    message: "Foto de perfil atualizada com sucesso",
    data: usuario,
    user: usuario,
  });
}

export async function removeAvatarController(req: AuthRequest, res: Response) {
  const usuario = await removeAvatar(req.user!.id);

  return res.json({
    success: true,
    message: "Foto de perfil removida com sucesso",
    data: usuario,
    user: usuario,
  });
}
