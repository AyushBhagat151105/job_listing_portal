import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const registerCustomRoutes = (registry: OpenAPIRegistry) => {

    // ─── Reusable Schemas ───────────────────────────────────────
    const JobSeekerProfileBody = registry.register(
        "JobSeekerProfileBody",
        z.object({
            headline: z.string().max(200).optional().openapi({ example: "Full Stack Developer" }),
            summary: z.string().max(2000).optional().openapi({ example: "Passionate about building web apps" }),
            phone: z.string().max(20).optional().openapi({ example: "+91-9876543210" }),
            location: z.string().max(200).optional().openapi({ example: "Mumbai, India" }),
            resumeUrl: z.string().url().optional().openapi({ example: "https://example.com/resume.pdf" }),
            skills: z.array(z.string().max(50)).max(30).optional().openapi({ example: ["React", "Node.js", "TypeScript"] }),
        })
    );

    const EmployerProfileBody = registry.register(
        "EmployerProfileBody",
        z.object({
            companyName: z.string().min(1).max(200).openapi({ example: "TechCorp India" }),
            companyLogo: z.string().url().optional().openapi({ example: "https://example.com/logo.png" }),
            industry: z.string().max(100).optional().openapi({ example: "Technology" }),
            website: z.string().url().optional().openapi({ example: "https://techcorp.in" }),
            description: z.string().max(2000).optional().openapi({ example: "Leading tech solutions company" }),
            location: z.string().max(200).optional().openapi({ example: "Bangalore, India" }),
            phone: z.string().max(20).optional().openapi({ example: "+91-9876543210" }),
        })
    );

    const JobListingBody = registry.register(
        "JobListingBody",
        z.object({
            title: z.string().min(1).max(200).openapi({ example: "Senior React Developer" }),
            description: z.string().min(1).max(5000).openapi({ example: "We're looking for an experienced React developer..." }),
            qualifications: z.string().max(3000).optional().openapi({ example: "3+ years experience with React" }),
            responsibilities: z.string().max(3000).optional().openapi({ example: "Build and maintain frontend applications" }),
            location: z.string().min(1).max(200).openapi({ example: "Mumbai, India" }),
            jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"]).openapi({ example: "FULL_TIME" }),
            salaryMin: z.number().int().nonnegative().optional().openapi({ example: 800000 }),
            salaryMax: z.number().int().nonnegative().optional().openapi({ example: 1500000 }),
            status: z.enum(["ACTIVE", "CLOSED", "DRAFT"]).optional().openapi({ example: "ACTIVE" }),
        })
    );

    const ApplicationBody = registry.register(
        "ApplicationBody",
        z.object({
            jobListingId: z.string().min(1).openapi({ example: "cm1abc123def456" }),
            coverLetter: z.string().max(3000).optional().openapi({ example: "I am excited to apply for this role..." }),
            resumeUrl: z.string().url().optional().openapi({ example: "https://example.com/resume.pdf" }),
        })
    );

    const IdParam = z.object({ id: z.string().openapi({ example: "cm1abc123def456" }) });
    const JobIdParam = z.object({ jobId: z.string().openapi({ example: "cm1abc123def456" }) });

    const SuccessResponse = z.object({ message: z.string() });
    const ErrorResponse = z.object({
        success: z.boolean().openapi({ example: false }),
        message: z.string().openapi({ example: "Validation failed" }),
        errors: z.array(z.string()),
    });

    // ─── Profile Routes ─────────────────────────────────────────

    registry.registerPath({
        method: "get",
        path: "/api/v1/profile/job-seeker",
        tags: ["Profile"],
        summary: "Get my job seeker profile",
        security: [{ bearerAuth: [] }],
        responses: {
            200: { description: "Job seeker profile", content: { "application/json": { schema: JobSeekerProfileBody } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: ErrorResponse } } },
        },
    });

    registry.registerPath({
        method: "post",
        path: "/api/v1/profile/job-seeker",
        tags: ["Profile"],
        summary: "Create job seeker profile",
        security: [{ bearerAuth: [] }],
        request: { body: { content: { "application/json": { schema: JobSeekerProfileBody } } } },
        responses: {
            201: { description: "Profile created", content: { "application/json": { schema: JobSeekerProfileBody } } },
            400: { description: "Validation error", content: { "application/json": { schema: ErrorResponse } } },
        },
    });

    registry.registerPath({
        method: "put",
        path: "/api/v1/profile/job-seeker",
        tags: ["Profile"],
        summary: "Update job seeker profile",
        security: [{ bearerAuth: [] }],
        request: { body: { content: { "application/json": { schema: JobSeekerProfileBody } } } },
        responses: {
            200: { description: "Profile updated", content: { "application/json": { schema: JobSeekerProfileBody } } },
            400: { description: "Validation error", content: { "application/json": { schema: ErrorResponse } } },
        },
    });

    registry.registerPath({
        method: "get",
        path: "/api/v1/profile/employer",
        tags: ["Profile"],
        summary: "Get my employer profile",
        security: [{ bearerAuth: [] }],
        responses: {
            200: { description: "Employer profile", content: { "application/json": { schema: EmployerProfileBody } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: ErrorResponse } } },
        },
    });

    registry.registerPath({
        method: "post",
        path: "/api/v1/profile/employer",
        tags: ["Profile"],
        summary: "Create employer profile",
        security: [{ bearerAuth: [] }],
        request: { body: { content: { "application/json": { schema: EmployerProfileBody } } } },
        responses: {
            201: { description: "Profile created", content: { "application/json": { schema: EmployerProfileBody } } },
            400: { description: "Validation error", content: { "application/json": { schema: ErrorResponse } } },
        },
    });

    registry.registerPath({
        method: "put",
        path: "/api/v1/profile/employer",
        tags: ["Profile"],
        summary: "Update employer profile",
        security: [{ bearerAuth: [] }],
        request: { body: { content: { "application/json": { schema: EmployerProfileBody } } } },
        responses: {
            200: { description: "Profile updated", content: { "application/json": { schema: EmployerProfileBody } } },
            400: { description: "Validation error", content: { "application/json": { schema: ErrorResponse } } },
        },
    });

    // ─── Job Listing Routes ─────────────────────────────────────

    registry.registerPath({
        method: "get",
        path: "/api/v1/jobs",
        tags: ["Jobs"],
        summary: "List active jobs (with search & filters)",
        request: {
            query: z.object({
                q: z.string().optional().openapi({ description: "Search keyword", example: "react developer" }),
                jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"]).optional(),
                location: z.string().optional().openapi({ example: "Mumbai" }),
                salaryMin: z.number().optional().openapi({ example: 500000 }),
                salaryMax: z.number().optional().openapi({ example: 2000000 }),
                page: z.number().optional().openapi({ example: 1 }),
                limit: z.number().optional().openapi({ example: 20 }),
            }),
        },
        responses: {
            200: { description: "List of jobs", content: { "application/json": { schema: z.object({ data: z.array(JobListingBody), total: z.number() }) } } },
        },
    });

    registry.registerPath({
        method: "get",
        path: "/api/v1/jobs/{id}",
        tags: ["Jobs"],
        summary: "Get job details",
        request: { params: IdParam },
        responses: {
            200: { description: "Job details", content: { "application/json": { schema: JobListingBody } } },
            404: { description: "Job not found", content: { "application/json": { schema: ErrorResponse } } },
        },
    });

    registry.registerPath({
        method: "post",
        path: "/api/v1/jobs",
        tags: ["Jobs"],
        summary: "Create a job listing",
        security: [{ bearerAuth: [] }],
        request: { body: { content: { "application/json": { schema: JobListingBody } } } },
        responses: {
            201: { description: "Job created", content: { "application/json": { schema: JobListingBody } } },
            400: { description: "Validation error", content: { "application/json": { schema: ErrorResponse } } },
        },
    });

    registry.registerPath({
        method: "put",
        path: "/api/v1/jobs/{id}",
        tags: ["Jobs"],
        summary: "Update own job listing",
        security: [{ bearerAuth: [] }],
        request: {
            params: IdParam,
            body: { content: { "application/json": { schema: JobListingBody } } },
        },
        responses: {
            200: { description: "Job updated", content: { "application/json": { schema: JobListingBody } } },
            404: { description: "Job not found", content: { "application/json": { schema: ErrorResponse } } },
        },
    });

    registry.registerPath({
        method: "delete",
        path: "/api/v1/jobs/{id}",
        tags: ["Jobs"],
        summary: "Delete a job listing",
        security: [{ bearerAuth: [] }],
        request: { params: IdParam },
        responses: {
            200: { description: "Job deleted", content: { "application/json": { schema: SuccessResponse } } },
            404: { description: "Job not found", content: { "application/json": { schema: ErrorResponse } } },
        },
    });

    // ─── Application Routes ─────────────────────────────────────

    registry.registerPath({
        method: "post",
        path: "/api/v1/applications",
        tags: ["Applications"],
        summary: "Apply to a job",
        security: [{ bearerAuth: [] }],
        request: { body: { content: { "application/json": { schema: ApplicationBody } } } },
        responses: {
            201: { description: "Application submitted", content: { "application/json": { schema: SuccessResponse } } },
            400: { description: "Validation error", content: { "application/json": { schema: ErrorResponse } } },
            409: { description: "Already applied", content: { "application/json": { schema: ErrorResponse } } },
        },
    });

    registry.registerPath({
        method: "get",
        path: "/api/v1/applications/my",
        tags: ["Applications"],
        summary: "List my applications (job seeker)",
        security: [{ bearerAuth: [] }],
        responses: {
            200: { description: "My applications", content: { "application/json": { schema: z.object({ data: z.array(ApplicationBody) }) } } },
        },
    });

    registry.registerPath({
        method: "get",
        path: "/api/v1/applications/job/{jobId}",
        tags: ["Applications"],
        summary: "List applications for a job (employer)",
        security: [{ bearerAuth: [] }],
        request: { params: JobIdParam },
        responses: {
            200: { description: "Applications for job", content: { "application/json": { schema: z.object({ data: z.array(ApplicationBody) }) } } },
        },
    });

    registry.registerPath({
        method: "patch",
        path: "/api/v1/applications/{id}/status",
        tags: ["Applications"],
        summary: "Update application status (employer)",
        security: [{ bearerAuth: [] }],
        request: {
            params: IdParam,
            body: { content: { "application/json": { schema: z.object({ status: z.enum(["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "ACCEPTED"]) }) } } },
        },
        responses: {
            200: { description: "Status updated", content: { "application/json": { schema: SuccessResponse } } },
            404: { description: "Application not found", content: { "application/json": { schema: ErrorResponse } } },
        },
    });

    // ─── Dashboard Routes ───────────────────────────────────────

    registry.registerPath({
        method: "get",
        path: "/api/v1/dashboard/seeker",
        tags: ["Dashboard"],
        summary: "Job seeker dashboard stats",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Dashboard stats",
                content: {
                    "application/json": {
                        schema: z.object({
                            totalApplications: z.number().openapi({ example: 12 }),
                            statusBreakdown: z.object({
                                PENDING: z.number().openapi({ example: 5 }),
                                REVIEWED: z.number().openapi({ example: 3 }),
                                SHORTLISTED: z.number().openapi({ example: 2 }),
                                REJECTED: z.number().openapi({ example: 1 }),
                                ACCEPTED: z.number().openapi({ example: 1 }),
                            }),
                        }),
                    },
                },
            },
        },
    });

    registry.registerPath({
        method: "get",
        path: "/api/v1/dashboard/employer",
        tags: ["Dashboard"],
        summary: "Employer dashboard stats",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Dashboard stats",
                content: {
                    "application/json": {
                        schema: z.object({
                            totalListings: z.number().openapi({ example: 8 }),
                            activeListings: z.number().openapi({ example: 5 }),
                            totalApplications: z.number().openapi({ example: 42 }),
                            statusBreakdown: z.object({
                                PENDING: z.number().openapi({ example: 20 }),
                                REVIEWED: z.number().openapi({ example: 10 }),
                                SHORTLISTED: z.number().openapi({ example: 5 }),
                                REJECTED: z.number().openapi({ example: 4 }),
                                ACCEPTED: z.number().openapi({ example: 3 }),
                            }),
                        }),
                    },
                },
            },
        },
    });

    // ─── Security Scheme ────────────────────────────────────────
    registry.registerComponent("securitySchemes", "bearerAuth", {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Better Auth JWT token from /api/auth/sign-in/email",
    });
};
