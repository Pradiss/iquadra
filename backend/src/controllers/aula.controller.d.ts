import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
export declare function createAulaController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listAulasController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getAulaController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function cancelarAulaController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=aula.controller.d.ts.map