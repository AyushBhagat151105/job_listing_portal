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
import {
    listJobs,
    getJobDetails,
    createJobListing,
    updateJobListing,
    deleteJobListing
} from "../controller/job.controller";

const router = Router();

router.get(
    "/",
    validate(jobSearchQuerySchema, "query"),
    listJobs
);

router.get(
    "/:id",
    validate(idParamSchema, "params"),
    getJobDetails
);

router.post(
    "/",
    authMiddleware,
    requireRole("employer"),
    validate(createJobListingSchema),
    createJobListing
);

router.put(
    "/:id",
    authMiddleware,
    requireRole("employer"),
    validate(idParamSchema, "params"),
    validate(updateJobListingSchema),
    updateJobListing
);

router.delete(
    "/:id",
    authMiddleware,
    requireRole("employer", "admin"),
    validate(idParamSchema, "params"),
    deleteJobListing
);

export default router;
