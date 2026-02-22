import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";

import {
    getSeekerDashboardStats,
    getEmployerDashboardStats
} from "../controller/dashboard.controller";

const router = Router();

router.get(
    "/seeker",
    authMiddleware,
    requireRole("job_seeker"),
    getSeekerDashboardStats
);

router.get(
    "/employer",
    authMiddleware,
    requireRole("employer"),
    getEmployerDashboardStats
);

export default router;
