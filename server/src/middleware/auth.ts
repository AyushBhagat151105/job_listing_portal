import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { ApiError } from "../utils/apiError";

type Session = typeof auth.$Infer.Session;

export interface AuthenticatedRequest extends Request {
    session: Session;
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            throw new ApiError(401, "Unauthorized: No valid session found");
        }

        (req as AuthenticatedRequest).session = session;
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError(401, "Unauthorized: Authentication failed"));
        }
    }
};
