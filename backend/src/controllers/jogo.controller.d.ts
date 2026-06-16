import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
export declare function createJogoController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listJogosController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getJogoController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function participarJogoController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function sairJogoController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function cancelarJogoController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=jogo.controller.d.ts.map