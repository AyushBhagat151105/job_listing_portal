import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { config } from ".";

export const registry = new OpenAPIRegistry();


const apiDescription = `
Advantage Gen API - Backend for wardrobe management with real-time sync support.

**Authentication**: All endpoints require Better-auth JWT in Authorization header.
`;
export const generateOpenAPIDocument = () => {

    const doc = new OpenApiGeneratorV3(registry.definitions).generateDocument({
        openapi: "3.0.3",
        info: {
            title: "Advantage Gen API",
            version: "1.0.0",
            description: apiDescription,
        },
        servers: [{ url: `http://localhost:${config.PORT}` }],
        tags: [

        ],
    });

    (doc as unknown as Record<string, unknown>)["x-tagGroups"] = [
        {
            name: "API Routes",
        },
    ];

    return doc;
};