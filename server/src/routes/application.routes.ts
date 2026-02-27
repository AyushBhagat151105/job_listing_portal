import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import {
    createApplicationSchema,
    updateApplicationStatusSchema,
    idParamSchema,
    jobIdParamSchema,
} from "../validators/schemas";
import { jobApplicationLimiter } from "../middleware/rateLimiter";

import {
    applyForJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus
} from "../controller/application.controller";

const router = Router();

router.post(
    "/",
    authMiddleware,
    requireRole("job_seeker"),
    jobApplicationLimiter,
    validate(createApplicationSchema),
    applyForJob
);

router.get(
    "/my",
    authMiddleware,
    requireRole("job_seeker"),
    getMyApplications
);

router.get(
    "/job/:jobId",
    authMiddleware,
    requireRole("employer"),
    validate(jobIdParamSchema, "params"),
    getJobApplications
);

router.patch(
    "/:id/status",
    authMiddleware,
    requireRole("employer"),
    validate(idParamSchema, "params"),
    validate(updateApplicationStatusSchema),
    updateApplicationStatus
);

export default router;
