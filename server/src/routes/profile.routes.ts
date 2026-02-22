import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import {
    createJobSeekerProfileSchema,
    updateJobSeekerProfileSchema,
    createEmployerProfileSchema,
    updateEmployerProfileSchema,
} from "../validators/schemas";
import {
    getJobSeekerProfile,
    createJobSeekerProfile,
    updateJobSeekerProfile,
    getEmployerProfile,
    createEmployerProfile,
    updateEmployerProfile
} from "../controller/profile.controller";

const router = Router();

// ─── Job Seeker ─────────────────────────────────────────────

router.get(
    "/job-seeker",
    authMiddleware,
    requireRole("job_seeker"),
    getJobSeekerProfile
);

router.post(
    "/job-seeker",
    authMiddleware,
    requireRole("job_seeker"),
    validate(createJobSeekerProfileSchema),
    createJobSeekerProfile
);

router.put(
    "/job-seeker",
    authMiddleware,
    requireRole("job_seeker"),
    validate(updateJobSeekerProfileSchema),
    updateJobSeekerProfile
);

// ─── Employer ───────────────────────────────────────────────

router.get(
    "/employer",
    authMiddleware,
    requireRole("employer"),
    getEmployerProfile
);

router.post(
    "/employer",
    authMiddleware,
    requireRole("employer"),
    validate(createEmployerProfileSchema),
    createEmployerProfile
);

router.put(
    "/employer",
    authMiddleware,
    requireRole("employer"),
    validate(updateEmployerProfileSchema),
    updateEmployerProfile
);

export default router;
