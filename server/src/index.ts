import express, { type Request, type Response } from "express";
import cors from "cors";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { generateOpenAPIDocument } from "./config/openapi";
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

app.get("/v1/openapi.json", (req: Request, res: Response) => {
    res.json(generateOpenAPIDocument());
});

app.use(
    "/docs",
    apiReference({
        sources: [
            { url: "/v1/openapi.json", title: "API" },
            { url: "/api/auth/open-api/generate-schema", title: "Auth" },
        ],
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