import { describe, it, expect } from "bun:test";
import request from "supertest";
import app from "../app";

describe("API Integration - App Routes", () => {

    it("should expose swagger openapi.json route without crashing", async () => {
        const response = await request(app).get("/v1/openapi.json");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("openapi");
        expect(response.body).toHaveProperty("info");
        expect(response.body).toHaveProperty("paths");
    });

    it("should hit 404 handler for completely invalid API routes", async () => {
        const response = await request(app).get("/api/v1/this-route-does-literally-not-exist");

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toMatch(/Not Found/i);
    });

    // We expect a 401 Unauthorized here since we did not provide a Better Auth header, 
    // which signifies the router mounted the endpoints and the auth middleware actively defends it.
    it("should defend the jobs listing creation endpoint with Auth Middleware", async () => {
        const response = await request(app).post("/api/v1/jobs").send({});

        expect(response.status).toBe(401);
    });

    it("should allow listing public jobs without auth", async () => {
        // Technically listing jobs expects search queries, let's see if the route itself is open.
        // Assuming listing doesn't require auth (most job portals don't).
        const response = await request(app).get("/api/v1/jobs");

        // It could be 200 array or perhaps a Zod query parameter validation error if required params missed,
        // but it shouldn't specifically be a 401 missing auth error.
        expect(response.status).not.toBe(401);
    });
});
