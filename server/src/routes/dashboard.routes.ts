import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";

const router = Router();

router.get(
    "/seeker",
    authMiddleware,
    requireRole("job_seeker"),
    (_req, res) => res.json({ message: "SEEKER dashboard stats" })
);

router.get(
    "/employer",
    authMiddleware,
    requireRole("employer"),
    (_req, res) => res.json({ message: "EMPLOYER dashboard stats" })
);

export default router;
