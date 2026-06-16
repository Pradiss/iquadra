import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
export declare function convidarJogadorController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listarConvitesJogosController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function aceitarConviteJogoController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function recusarConviteJogoController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=convite-jogo.controller.d.ts.map