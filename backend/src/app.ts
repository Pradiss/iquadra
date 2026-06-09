import express from "express";
import cors from "cors";


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

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.json({
    message: "API IQuadra rodando",
  });
});


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

export { app };