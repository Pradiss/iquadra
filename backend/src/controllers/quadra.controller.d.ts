import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
export declare function createQuadraController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listQuadrasController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getQuadraController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateQuadraController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateStatusQuadraController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=quadra.controller.d.ts.map