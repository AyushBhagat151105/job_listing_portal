import express, { type Request, type Response } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import { ApiError } from "./utils/apiError";
import { generateMergedOpenAPIDocument } from "./config/openapi";
import { apiReference } from "@scalar/express-api-reference";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import profileRoutes from "./routes/profile.routes";
import jobRoutes from "./routes/job.routes";
import applicationRoutes from "./routes/application.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import healthRoutes from "./routes/health.routes";
import { config } from "./config";
import { globalLimiter, authLimiter } from "./middleware/rateLimiter";

const app = express();

app.use(
    cors({
        origin: config.FRONTEND_URL,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: "Content-Type,Authorization,Cache-Control",
        credentials: true,
    })
);

app.use("/api/auth", toNodeHandler(auth));

app.use("/api/v1", globalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/v1/openapi.json", async (_req: Request, res: Response) => {
    const authSchema = await auth.api.generateOpenAPISchema();

    const signUpPath = authSchema.paths?.["/sign-up/email"];
    if (signUpPath?.post?.requestBody?.content?.["application/json"]?.schema?.properties) {
        signUpPath.post.requestBody.content["application/json"].schema.properties.role = {
            type: "string",
            description: "User role — choose 'job_seeker' or 'employer'",
            enum: ["job_seeker", "employer"],
            default: "job_seeker",
        };
    }

    res.json(generateMergedOpenAPIDocument(authSchema));
});

app.use(
    "/docs",
    apiReference({
        url: "/v1/openapi.json",
        theme: "deepSpace",
    })
);

app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/health", healthRoutes);

// Catch-all 404 for undefined routes before hitting the error handler
app.use((_req: Request, _res: Response, next) => {
    next(new ApiError(404, "Route not found"));
});

app.use(errorHandler);

export default app;
