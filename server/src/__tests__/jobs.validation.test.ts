import { describe, it, expect } from "bun:test";
import request from "supertest";
import app from "../app";

describe("API Integration - Public Job Endpoint Validation Edges", () => {

    it("should accept valid search parameters on job listing", async () => {
        // Technically this might return 200 with 0 items if the DB is empty
        const response = await request(app).get("/api/v1/jobs?page=1&limit=5&jobType=FULL_TIME&salaryMin=50000");

        // Assert it passes validation and auth (returns 200 OK)
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
    });

    it("should reject negative pagination limits with a 400 Bad Request", async () => {
        const response = await request(app).get("/api/v1/jobs?limit=-5");

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/Validation failed/i);
    });

    it("should reject non-integer string types for salary filters", async () => {
        const response = await request(app).get("/api/v1/jobs?salaryMin=fiftythousand");

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/Validation failed/i);
    });

    it("should reject invalid jobType enums", async () => {
        const response = await request(app).get("/api/v1/jobs?jobType=INVALID_ENUM_VALUE");

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/Validation failed/i);
    });

    it("should validate the job details ID parameter", async () => {
        // If the ID isn't found, it returns 404 (or throws invalid format depending on param schema)
        // Since we are mocking an ID that doesn't exist, we expect a 404 Not Found from Prisma
        // If it was returning 400 it means Zod caught it.
        const response = await request(app).get("/api/v1/jobs/invalid-id-that-does-not-exist");

        console.log("JOB ID RESPONSE:", response.body);

        expect(response.status).toBe(404);
        expect(response.body.message).toMatch(/Job listing not found|Route not found/i);
    });

});
