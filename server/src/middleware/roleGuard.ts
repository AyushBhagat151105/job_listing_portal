import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "./auth";
import { ApiError } from "../utils/apiError";

/**
 * Role-guard middleware factory.
 * Use AFTER `authMiddleware` to restrict route access by role.
 *
 * @example
 * router.post("/jobs", authMiddleware, requireRole("employer", "admin"), createJob);
 * router.post("/apply", authMiddleware, requireRole("job_seeker"), applyForJob);
 */
export const requireRole = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const session = (req as AuthenticatedRequest).session;
        const userRole = (session.user as any).role || "job_seeker";

        if (!roles.includes(userRole)) {
            return next(
                new ApiError(
                    403,
                    `Forbidden: requires one of [${roles.join(", ")}] role`
                )
            );
        }

        next();
    };
};
