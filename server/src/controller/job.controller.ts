import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import type { ValidatedRequest } from "../middleware/validate";
import type { Prisma } from "../generated/prisma/client";
import type { z } from "zod/v4";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiRespons";

import {
    createJobListingSchema,
    updateJobListingSchema,
    idParamSchema,
    jobSearchQuerySchema,
} from "../validators/schemas";

// ─── List Jobs ──────────────────────────────────────────────

export const listJobs = asyncHandler(async (req: ValidatedRequest<z.ZodTypeAny, typeof jobSearchQuerySchema>, res: Response) => {
    const { q, jobType, location, salaryMin, salaryMax, status, page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Build the query where clause based on filter parameters
    const where: Prisma.JobListingWhereInput = {};

    if (q) {
        where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
        ];
    }

    if (jobType) where.jobType = jobType;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (status) where.status = status;

    // Default to ACTIVE jobs if not specified, unless filtering as Employer
    if (typeof status === 'undefined') {
        where.status = "ACTIVE";
    }

    if (salaryMin !== undefined) where.salaryMin = { gte: salaryMin };
    if (salaryMax !== undefined) where.salaryMax = { lte: salaryMax };

    const [jobs, totalCount] = await Promise.all([
        prisma.jobListing.findMany({
            where,
            include: {
                employerProfile: {
                    select: {
                        companyName: true,
                        companyLogo: true,
                        industry: true,
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.jobListing.count({ where })
    ]);

    return res.status(200).json(new ApiResponse(200, "Jobs retrieved successfully", {
        jobs,
        pagination: {
            totalItems: totalCount,
            currentPage: page,
            pageSize: limit,
            totalPages: Math.ceil(totalCount / limit)
        }
    }));
});

// ─── Get Job Details ────────────────────────────────────────

export const getJobDetails = asyncHandler(async (req: ValidatedRequest<z.ZodTypeAny, z.ZodTypeAny, typeof idParamSchema>, res: Response) => {
    const { id } = req.params;

    const job = await prisma.jobListing.findUnique({
        where: { id },
        include: {
            employerProfile: {
                select: {
                    companyName: true,
                    companyLogo: true,
                    industry: true,
                    website: true,
                    description: true,
                    location: true,
                }
            }
        }
    });

    if (!job) {
        throw new ApiError(404, "Job listing not found");
    }

    return res.status(200).json(new ApiResponse(200, "Job retrieved successfully", job));
});

// ─── Create Job ─────────────────────────────────────────────

export const createJobListing = asyncHandler(async (req: ValidatedRequest<typeof createJobListingSchema>, res: Response) => {
    const user = req.user.id;
    const { title, description, qualifications, responsibilities, location, jobType, salaryMin, salaryMax, status } = req.body;

    // Verify user actually has an employer profile before creating jobs
    const employerProfile = await prisma.employerProfile.findUnique({
        where: { userId: user }
    });

    if (!employerProfile) {
        throw new ApiError(403, "You must create an employer profile before posting job listings");
    }

    const job = await prisma.jobListing.create({
        data: {
            title,
            description,
            qualifications,
            responsibilities,
            location,
            jobType,
            salaryMin,
            salaryMax,
            status: status ?? "ACTIVE",
            employerProfileId: employerProfile.id,
        }
    });

    return res.status(201).json(new ApiResponse(201, "Job created successfully", job));
});

// ─── Update Job ─────────────────────────────────────────────

export const updateJobListing = asyncHandler(async (req: ValidatedRequest<typeof updateJobListingSchema, z.ZodTypeAny, typeof idParamSchema>, res: Response) => {
    const user = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    const employerProfile = await prisma.employerProfile.findUnique({
        where: { userId: user }
    });

    if (!employerProfile) {
        throw new ApiError(403, "Employer profile not found");
    }

    // Verify ownership of the job
    const existingJob = await prisma.jobListing.findUnique({
        where: { id }
    });

    if (!existingJob) {
        throw new ApiError(404, "Job listing not found");
    }

    if (existingJob.employerProfileId !== employerProfile.id) {
        throw new ApiError(403, "You do not have permission to edit this job listing");
    }

    const job = await prisma.jobListing.update({
        where: { id },
        data: updateData
    });

    return res.status(200).json(new ApiResponse(200, "Job updated successfully", job));
});

// ─── Delete Job ─────────────────────────────────────────────

export const deleteJobListing = asyncHandler(async (req: ValidatedRequest<z.ZodTypeAny, z.ZodTypeAny, typeof idParamSchema>, res: Response) => {
    const user = req.user;
    const { id } = req.params;

    const existingJob = await prisma.jobListing.findUnique({
        where: { id }
    });

    if (!existingJob) {
        throw new ApiError(404, "Job listing not found");
    }

    // Admins can delete any job. Employers can only delete their own jobs.
    if (user.role !== "admin") {
        const employerProfile = await prisma.employerProfile.findUnique({
            where: { userId: user.id }
        });

        if (!employerProfile || existingJob.employerProfileId !== employerProfile.id) {
            throw new ApiError(403, "You do not have permission to delete this job listing");
        }
    }

    await prisma.jobListing.delete({
        where: { id }
    });

    return res.status(200).json(new ApiResponse(200, "Job deleted successfully"));
});
