import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
export declare function createBloqueioController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listBloqueiosController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteBloqueioController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=bloqueio.controller.d.ts.map