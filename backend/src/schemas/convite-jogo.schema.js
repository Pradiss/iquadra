"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convidarJogadorSchema = void 0;
const zod_1 = require("zod");
exports.convidarJogadorSchema = zod_1.z.object({
    convidado_usuario_id: zod_1.z.string().uuid(),
});
//# sourceMappingURL=convite-jogo.schema.js.map