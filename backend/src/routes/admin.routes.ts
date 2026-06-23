// routes/admin.routes.ts
import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase";

const router = Router();

router.post("/admin/users/:userId/logout-all", async (req, res) => {
  const { userId } = req.params;

  await supabaseAdmin.auth.admin.signOut(userId, "global");

  return res.json({
    success: true,
    message: "Usuário deslogado de todos os dispositivos.",
  });
});

export default router;