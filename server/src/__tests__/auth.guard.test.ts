import { describe, it, expect } from "bun:test";
import request from "supertest";
import app from "../app";

describe("API Integration - Authentication Security Guard", () => {
    // Array of strictly protected endpoints we want to verify are shielded by 401s
    const protectedRoutes = [
        // Profile Routes
        { method: "get", url: "/api/v1/profile/job-seeker" },
        { method: "post", url: "/api/v1/profile/job-seeker" },
        { method: "put", url: "/api/v1/profile/job-seeker" },
        { method: "get", url: "/api/v1/profile/employer" },
        { method: "post", url: "/api/v1/profile/employer" },
        { method: "put", url: "/api/v1/profile/employer" },
        { method: "get", url: "/api/v1/profile/applicant/cm123" },
        { method: "get", url: "/api/v1/profile/company/cm123" },
        { method: "get", url: "/api/v1/profile/company/cm123/jobs" },

        // Job Routes
        { method: "post", url: "/api/v1/jobs" },
        { method: "put", url: "/api/v1/jobs/cm123" },
        { method: "delete", url: "/api/v1/jobs/cm123" },

        // Application Routes
        { method: "post", url: "/api/v1/applications" },
        { method: "get", url: "/api/v1/applications/my" },
        { method: "get", url: "/api/v1/applications/job/cm123" },
        { method: "patch", url: "/api/v1/applications/cm123/status" },

        // Dashboard Routes
        { method: "get", url: "/api/v1/dashboard/seeker" },
        { method: "get", url: "/api/v1/dashboard/employer" },
    ];

    for (const route of protectedRoutes) {
        it(`should block unauthenticated ${route.method.toUpperCase()} requests to ${route.url}`, async () => {
            // @ts-ignore - dynamically accessing supertest methods
            let req = request(app)[route.method](route.url);

            if (route.method !== "get") {
                req = req.send({});
            }

            const response = await req;

            // Should strictly be a 401 Unauthorized, never a 200, 400, or 404 (which implies it reached the controller/validation)
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("message");
        });
    }
});
