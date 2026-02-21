import express, { type Request, type Response } from "express";
import cors from "cors";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { generateMergedOpenAPIDocument } from "./config/openapi";
import { apiReference } from "@scalar/express-api-reference";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app = express();
const port = config.PORT;

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(
    cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: "Content-Type,Authorization",
        credentials: true,
    })
);

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

app.use(errorHandler);

const startServer = async () => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
};

startServer();

