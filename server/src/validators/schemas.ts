import { z } from "zod/v4";

// ─── Job Seeker Profile ─────────────────────────────────────

export const createJobSeekerProfileSchema = z.object({
    headline: z.string().max(200).optional(),
    summary: z.string().max(2000).optional(),
    phone: z.string().max(20).optional(),
    location: z.string().max(200).optional(),
    resumeUrl: z.url().optional(),
    skills: z.array(z.string().max(50)).max(30).optional(),
});

export const updateJobSeekerProfileSchema = createJobSeekerProfileSchema;

// ─── Employer Profile ───────────────────────────────────────

export const createEmployerProfileSchema = z.object({
    companyName: z.string().min(1, "Company name is required").max(200),
    companyLogo: z.url().optional(),
    industry: z.string().max(100).optional(),
    website: z.url().optional(),
    description: z.string().max(2000).optional(),
    location: z.string().max(200).optional(),
    phone: z.string().max(20).optional(),
});

export const updateEmployerProfileSchema = createEmployerProfileSchema.partial();

// ─── Job Listing ────────────────────────────────────────────

const jobTypeEnum = z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"]);
const jobStatusEnum = z.enum(["ACTIVE", "CLOSED", "DRAFT"]);

export const createJobListingSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().min(1, "Description is required").max(5000),
    qualifications: z.string().max(3000).optional(),
    responsibilities: z.string().max(3000).optional(),
    location: z.string().min(1, "Location is required").max(200),
    jobType: jobTypeEnum,
    salaryMin: z.number().int().nonnegative().optional(),
    salaryMax: z.number().int().nonnegative().optional(),
    status: jobStatusEnum.optional(),
}).refine(
    (data) => !data.salaryMin || !data.salaryMax || data.salaryMin <= data.salaryMax,
    { message: "salaryMin must be less than or equal to salaryMax" }
);

export const updateJobListingSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(5000).optional(),
    qualifications: z.string().max(3000).optional(),
    responsibilities: z.string().max(3000).optional(),
    location: z.string().min(1).max(200).optional(),
    jobType: jobTypeEnum.optional(),
    salaryMin: z.number().int().nonnegative().optional(),
    salaryMax: z.number().int().nonnegative().optional(),
    status: jobStatusEnum.optional(),
});

// ─── Job Application ────────────────────────────────────────

export const createApplicationSchema = z.object({
    jobListingId: z.string().min(1, "Job listing ID is required"),
    coverLetter: z.string().max(3000).optional(),
    resumeUrl: z.url().optional(),
});

const applicationStatusEnum = z.enum(["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "ACCEPTED"]);

export const updateApplicationStatusSchema = z.object({
    status: applicationStatusEnum,
});

// ─── Shared Param Schemas ───────────────────────────────────

export const idParamSchema = z.object({
    id: z.string().min(1),
});

export const jobIdParamSchema = z.object({
    jobId: z.string().min(1),
});

// ─── Search Query Schema ────────────────────────────────────

export const jobSearchQuerySchema = z.object({
    q: z.string().optional(),
    jobType: jobTypeEnum.optional(),
    location: z.string().optional(),
    salaryMin: z.coerce.number().int().nonnegative().optional(),
    salaryMax: z.coerce.number().int().nonnegative().optional(),
    status: jobStatusEnum.optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
});
