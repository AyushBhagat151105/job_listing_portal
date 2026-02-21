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

const router = Router();

router.post(
    "/",
    authMiddleware,
    requireRole("job_seeker"),
    validate(createApplicationSchema),
    (_req, res) => res.json({ message: "APPLY to job" })
);

router.get(
    "/my",
    authMiddleware,
    requireRole("job_seeker"),
    (_req, res) => res.json({ message: "LIST my applications" })
);

router.get(
    "/job/:jobId",
    authMiddleware,
    requireRole("employer"),
    validate(jobIdParamSchema, "params"),
    (_req, res) => res.json({ message: "LIST applications for job" })
);

router.patch(
    "/:id/status",
    authMiddleware,
    requireRole("employer"),
    validate(idParamSchema, "params"),
    validate(updateApplicationStatusSchema),
    (_req, res) => res.json({ message: "UPDATE application status" })
);

export default router;
