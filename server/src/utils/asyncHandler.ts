import type { NextFunction, Request, Response } from "express";

export const asyncHandler = (requestHandler: Function) => {
    return function (req: Request, res: Response, next: NextFunction) {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => {
            next(error);
        });
    };
};