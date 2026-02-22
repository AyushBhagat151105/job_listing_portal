import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import {
    createJobSeekerProfileSchema,
    updateJobSeekerProfileSchema,
    createEmployerProfileSchema,
    updateEmployerProfileSchema,
    idParamSchema,
} from "../validators/schemas";
import {
    getJobSeekerProfile,
    createJobSeekerProfile,
    updateJobSeekerProfile,
    getEmployerProfile,
    createEmployerProfile,
    updateEmployerProfile,
    getApplicantProfile,
    getCompanyProfile,
    getCompanyJobs
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

// ─── Public / Cross-Role Viewing ────────────────────────────

// Get an applicant's public profile (employers viewing applicants)
router.get(
    "/applicant/:id",
    authMiddleware,
    requireRole("employer"), // Only employers need to view applicants
    validate(idParamSchema, "params"),
    getApplicantProfile
);

// Get a company's public profile (anyone authenticated)
router.get(
    "/company/:id",
    authMiddleware,
    validate(idParamSchema, "params"),
    getCompanyProfile
);

// Get a company's job listings (anyone authenticated)
router.get(
    "/company/:id/jobs",
    authMiddleware,
    validate(idParamSchema, "params"),
    getCompanyJobs
);

export default router;
