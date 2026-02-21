import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { config } from ".";
import { registerCustomRoutes } from "./openapi-routes";

export const registry = new OpenAPIRegistry();
registerCustomRoutes(registry);

const apiDescription = `
Job Listing Portal API — connects job seekers with employers.

**Authentication**: All endpoints require Better-auth JWT in Authorization header.
`;

export const generateOpenAPIDocument = () => {
    const doc = new OpenApiGeneratorV3(registry.definitions).generateDocument({
        openapi: "3.0.3",
        info: {
            title: "Job Listing Portal API",
            version: "1.0.0",
            description: apiDescription,
        },
        servers: [{ url: `http://localhost:${config.PORT}` }],
        tags: [],
    });

    return doc;
};

export const generateMergedOpenAPIDocument = (authSchema: any) => {
    const apiDoc = generateOpenAPIDocument() as any;

    const JWT_PATHS = ["/jwks", "/token", "/refresh-token", "/get-access-token"];

    const getTag = (path: string) => {
        if (path.startsWith("/admin")) return "Admin";
        if (JWT_PATHS.some((p) => path === p)) return "JWT";
        return "Auth";
    };

    const authPaths: Record<string, any> = {};
    if (authSchema.paths) {
        for (const [path, methods] of Object.entries(authSchema.paths)) {
            const prefixedPath = `/api/auth${path}`;
            const tag = getTag(path);
            const taggedMethods: Record<string, any> = {};
            for (const [method, conf] of Object.entries(methods as any)) {
                taggedMethods[method] = { ...(conf as any), tags: [tag] };
            }
            authPaths[prefixedPath] = taggedMethods;
        }
    }

    const merged = {
        ...apiDoc,
        paths: {
            ...(apiDoc.paths || {}),
            ...authPaths,
        },
        tags: [
            ...(apiDoc.tags || []),
            { name: "Profile", description: "Job Seeker & Employer profile management" },
            { name: "Jobs", description: "Job listings — search, create, update, delete" },
            { name: "Applications", description: "Job applications — apply, track & manage" },
            { name: "Dashboard", description: "Dashboard stats for seekers & employers" },
            { name: "Auth", description: "Sign-up, sign-in, sessions & account management" },
            { name: "Admin", description: "User administration — roles, bans & impersonation" },
            { name: "JWT", description: "JSON Web Key Sets & token management" },
        ],
        components: {
            ...(apiDoc.components || {}),
            schemas: {
                ...(apiDoc.components?.schemas || {}),
                ...(authSchema.components?.schemas || {}),
            },
        },
    };

    merged["x-tagGroups"] = [
        { name: "API Routes", tags: ["Profile", "Jobs", "Applications", "Dashboard"] },
        { name: "Authentication", tags: ["Auth", "Admin", "JWT"] },
    ];

    return merged;
};
