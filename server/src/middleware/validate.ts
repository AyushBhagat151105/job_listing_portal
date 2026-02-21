import type { NextFunction, Request, Response } from "express";
import { z } from "zod/v4";
import { ApiError } from "../utils/apiError";

type ValidationTarget = "body" | "params" | "query";

export const validate = (
    schema: z.ZodType,
    target: ValidationTarget = "body"
) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[target]);

        if (!result.success) {
            const errors = z.prettifyError(result.error);
            return next(new ApiError(400, "Validation failed", [JSON.stringify(errors)]));
        }

        Object.defineProperty(req, target, {
            value: result.data,
            writable: true,
            configurable: true,
        });
        next();
    };
};

