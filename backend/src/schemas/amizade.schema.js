"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAmizadeSchema = void 0;
const zod_1 = require("zod");
exports.createAmizadeSchema = zod_1.z.object({
    amigo_id: zod_1.z.string().uuid(),
});
//# sourceMappingURL=amizade.schema.js.map