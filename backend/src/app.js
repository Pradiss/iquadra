"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const academia_routes_1 = __importDefault(require("./routes/academia.routes"));
const quadra_routes_1 = __importDefault(require("./routes/quadra.routes"));
const horario_quadra_routes_1 = __importDefault(require("./routes/horario-quadra.routes"));
const disponibilidade_routes_1 = __importDefault(require("./routes/disponibilidade.routes"));
const jogo_routes_1 = __importDefault(require("./routes/jogo.routes"));
const bloqueio_routes_1 = __importDefault(require("./routes/bloqueio.routes"));
const aula_routes_1 = __importDefault(require("./routes/aula.routes"));
const recorrencia_aula_routes_1 = __importDefault(require("./routes/recorrencia-aula.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const amizades_routes_1 = __importDefault(require("./routes/amizades.routes"));
const convite_jogo_routes_1 = __importDefault(require("./routes/convite-jogo.routes"));
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    return res.json({
        message: "API IQuadra rodando",
    });
});
app.use(auth_routes_1.default);
app.use(user_routes_1.default);
app.use(academia_routes_1.default);
app.use(quadra_routes_1.default);
app.use(horario_quadra_routes_1.default);
app.use(disponibilidade_routes_1.default);
app.use(jogo_routes_1.default);
app.use(bloqueio_routes_1.default);
app.use(aula_routes_1.default);
app.use(recorrencia_aula_routes_1.default);
app.use(dashboard_routes_1.default);
app.use(amizades_routes_1.default);
app.use(convite_jogo_routes_1.default);
//# sourceMappingURL=app.js.map