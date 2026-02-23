import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiRespons";

export const checkHealth = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const uptimeInSeconds = process.uptime();
    const memoryUsage = process.memoryUsage();

    const formatMemory = (bytes: number) => `${Math.round((bytes / 1024 / 1024) * 100) / 100} MB`;
    const healthData = {
        status: "ok",
        timestamp: new Date().toISOString(),
        process: {
            uptimeSeconds: uptimeInSeconds,
            nodeVersion: process.version,
            memory: {
                rss: formatMemory(memoryUsage.rss),
                heapTotal: formatMemory(memoryUsage.heapTotal),
                heapUsed: formatMemory(memoryUsage.heapUsed),
                external: formatMemory(memoryUsage.external),
            },
        },
        database: {
            status: "unknown",
            latency: 0,
        },
    };
    try {
        const dbStartTime = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const dbEndTime = Date.now();

        healthData.database.status = "ok";
        healthData.database.latency = dbEndTime - dbStartTime;

        res.status(200).json(new ApiResponse(200, "Up and Running", healthData));
    } catch (error) {
        healthData.status = "error";
        healthData.database.status = "down";

        console.error("Health Check - Database Error:", error);
        res.status(503).json(new ApiResponse(503, "Health Check - Database Error", healthData));
    }
});
