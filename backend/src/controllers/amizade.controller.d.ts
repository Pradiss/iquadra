import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
export declare function solicitarAmizadeController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listarAmizadesController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function aceitarAmizadeController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function recusarAmizadeController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function removerAmizadeController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=amizade.controller.d.ts.map