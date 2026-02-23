import { Router } from "express";
import { checkHealth } from "../controller/health.controller";

const router: Router = Router();

// Used for load balancers and container orchestrators (like Docker/Kubernetes) 
router.get("/", checkHealth);

export default router;
