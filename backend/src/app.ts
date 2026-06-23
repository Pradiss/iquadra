import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import academiaRoutes from "./routes/academia.routes";
import quadraRoutes from "./routes/quadra.routes";
import horarioQuadraRoutes from "./routes/horario-quadra.routes";
import disponibilidadeRoutes from "./routes/disponibilidade.routes";
import jogoRoutes from "./routes/jogo.routes";
import bloqueioRoutes from "./routes/bloqueio.routes";
import aulaRoutes from "./routes/aula.routes";
import recorrenciaAulaRoutes from "./routes/recorrencia-aula.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import amizadeRoutes from "./routes/amizades.routes";
import conviteJogoRoutes from "./routes/convite-jogo.routes";

import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { AppError } from "./errors/app-error";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware";
import { generalRateLimiter } from "./middlewares/rate-limit.middleware";
import { csrfMiddleware } from "./middlewares/csrf.middleware";
import adminRoutes from "./routes/admin.routes";


const app = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || env.CORS_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new AppError("Origem nao permitida pelo CORS", 403, "CORS_DENIED"));
    },
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));


app.get("/csrf-token", (req, res) => {
  const token = req.cookies?.playfy_csrf_token;

  return res.json({
    csrfToken: token,
  });
});

app.use(csrfMiddleware);

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public", "uploads"))
);
app.use(generalRateLimiter);

app.get("/", (req, res) => {
  return res.json({
    message: "API IQuadra rodando",
  });
});

app.use(adminRoutes);
app.use(authRoutes);
app.use(userRoutes)
app.use(academiaRoutes)
app.use(quadraRoutes);
app.use(horarioQuadraRoutes);
app.use(disponibilidadeRoutes)
app.use(jogoRoutes);
app.use(bloqueioRoutes);
app.use(aulaRoutes);
app.use(recorrenciaAulaRoutes);
app.use(dashboardRoutes);
app.use(amizadeRoutes);
app.use(conviteJogoRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };
