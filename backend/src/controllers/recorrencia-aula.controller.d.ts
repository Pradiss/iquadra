import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
export declare function createRecorrenciaAulaController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listRecorrenciasAulaController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function cancelarRecorrenciaAulaController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=recorrencia-aula.controller.d.ts.map