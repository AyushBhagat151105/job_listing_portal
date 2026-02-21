import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import {
    createJobListingSchema,
    updateJobListingSchema,
    idParamSchema,
    jobSearchQuerySchema,
} from "../validators/schemas";

const router = Router();

router.get(
    "/",
    validate(jobSearchQuerySchema, "query"),
    (_req, res) => res.json({ message: "LIST jobs" })
);

router.get(
    "/:id",
    validate(idParamSchema, "params"),
    (_req, res) => res.json({ message: "GET job details" })
);

router.post(
    "/",
    authMiddleware,
    requireRole("employer"),
    validate(createJobListingSchema),
    (_req, res) => res.json({ message: "CREATE job listing" })
);

router.put(
    "/:id",
    authMiddleware,
    requireRole("employer"),
    validate(idParamSchema, "params"),
    validate(updateJobListingSchema),
    (_req, res) => res.json({ message: "UPDATE job listing" })
);

router.delete(
    "/:id",
    authMiddleware,
    requireRole("employer", "admin"),
    validate(idParamSchema, "params"),
    (_req, res) => res.json({ message: "DELETE job listing" })
);

export default router;
