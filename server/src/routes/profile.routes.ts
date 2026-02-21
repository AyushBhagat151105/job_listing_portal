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

const router = Router();

// ─── Job Seeker ─────────────────────────────────────────────

router.get(
    "/job-seeker",
    authMiddleware,
    requireRole("job_seeker"),
    // TODO: controller
    (_req, res) => res.json({ message: "GET job seeker profile" })
);

router.post(
    "/job-seeker",
    authMiddleware,
    requireRole("job_seeker"),
    validate(createJobSeekerProfileSchema),
    (_req, res) => res.json({ message: "CREATE job seeker profile" })
);

router.put(
    "/job-seeker",
    authMiddleware,
    requireRole("job_seeker"),
    validate(updateJobSeekerProfileSchema),
    (_req, res) => res.json({ message: "UPDATE job seeker profile" })
);

// ─── Employer ───────────────────────────────────────────────

router.get(
    "/employer",
    authMiddleware,
    requireRole("employer"),
    (_req, res) => res.json({ message: "GET employer profile" })
);

router.post(
    "/employer",
    authMiddleware,
    requireRole("employer"),
    validate(createEmployerProfileSchema),
    (_req, res) => res.json({ message: "CREATE employer profile" })
);

router.put(
    "/employer",
    authMiddleware,
    requireRole("employer"),
    validate(updateEmployerProfileSchema),
    (_req, res) => res.json({ message: "UPDATE employer profile" })
);

export default router;
