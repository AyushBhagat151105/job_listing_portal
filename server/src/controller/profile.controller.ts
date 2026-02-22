import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";
import type { Prisma } from "../generated/prisma/client";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiRespons";
import type { z } from "zod/v4";
import type { ValidatedRequest } from "../middleware/validate";
import { createJobSeekerProfileSchema, updateJobSeekerProfileSchema } from "../validators/schemas";

export const getJobSeekerProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user.id;

    const profile = await prisma.jobSeekerProfile.findUnique({
        where: {
            userId: user
        }
    })

    if (!profile) {
        throw new ApiError(404, "Profile not found");
    }

    return res.status(200).json(new ApiResponse(200, "Profile found", profile))
})


export const createJobSeekerProfile = asyncHandler(async (req: ValidatedRequest<typeof createJobSeekerProfileSchema>, res: Response) => {
    const user = req.user.id;
    const { headline, summary, phone, location, resumeUrl, skills } = req.body;

    const profile = await prisma.jobSeekerProfile.create({
        data: {
            userId: user,
            headline,
            summary,
            phone,
            location,
            resumeUrl,
            skills,
        }
    })

    if (!profile) {
        throw new ApiError(500, "Failed to create profile");
    }

    return res.status(200).json(new ApiResponse(200, "Profile created successfully", profile))
})

export const updateJobSeekerProfile = asyncHandler(async (req: ValidatedRequest<typeof updateJobSeekerProfileSchema>, res: Response) => {
    const user = req.user.id;
    const { headline, summary, phone, location, resumeUrl, skills } = req.body;

    const profile = await prisma.jobSeekerProfile.update({
        where: {
            userId: user
        },
        data: {
            headline,
            summary,
            phone,
            location,
            resumeUrl,
            skills,
        }
    })

    if (!profile) {
        throw new ApiError(500, "Failed to update profile");
    }

    return res.status(200).json(new ApiResponse(200, "Profile updated successfully", profile))
})

// ─── Employer ───────────────────────────────────────────────

import { createEmployerProfileSchema, updateEmployerProfileSchema } from "../validators/schemas";

export const getEmployerProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user.id;

    const profile = await prisma.employerProfile.findUnique({
        where: {
            userId: user
        }
    })

    if (!profile) {
        throw new ApiError(404, "Profile not found");
    }

    return res.status(200).json(new ApiResponse(200, "Profile found", profile))
})


export const createEmployerProfile = asyncHandler(async (req: ValidatedRequest<typeof createEmployerProfileSchema>, res: Response) => {
    const user = req.user.id;
    const { companyName, companyLogo, industry, website, description, location, phone } = req.body;

    const profile = await prisma.employerProfile.create({
        data: {
            userId: user,
            companyName,
            companyLogo,
            industry,
            website,
            description,
            location,
            phone,
        }
    })

    if (!profile) {
        throw new ApiError(500, "Failed to create profile");
    }

    return res.status(200).json(new ApiResponse(200, "Profile created successfully", profile))
})

export const updateEmployerProfile = asyncHandler(async (req: ValidatedRequest<typeof updateEmployerProfileSchema>, res: Response) => {
    const user = req.user.id;
    const { companyName, companyLogo, industry, website, description, location, phone } = req.body;

    const profile = await prisma.employerProfile.update({
        where: {
            userId: user
        },
        data: {
            companyName,
            companyLogo,
            industry,
            website,
            description,
            location,
            phone,
        }
    })

    if (!profile) {
        throw new ApiError(500, "Failed to update profile");
    }

    return res.status(200).json(new ApiResponse(200, "Profile updated successfully", profile))
})

// ─── Public / Cross-Role Viewing ────────────────────────────

export const getApplicantProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;

    const profile = await prisma.jobSeekerProfile.findUnique({
        where: { userId: id },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    image: true
                }
            }
        }
    });

    if (!profile) {
        throw new ApiError(404, "Applicant profile not found");
    }

    return res.status(200).json(new ApiResponse(200, "Applicant profile retrieved", profile));
});

export const getCompanyProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;

    const profile = await prisma.employerProfile.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    name: true,
                    image: true
                }
            }
        }
    });

    if (!profile) {
        throw new ApiError(404, "Company not found");
    }

    return res.status(200).json(new ApiResponse(200, "Company profile retrieved", profile));
});

export const getCompanyJobs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string; // EmployerProfile ID
    const status = req.query.status as string | undefined;

    const where: Prisma.JobListingWhereInput = { employerProfileId: id };

    // If a job seeker is viewing, they should only see ACTIVE jobs
    if (req.user.role === 'job_seeker') {
        where.status = 'ACTIVE';
    } else if (status) {
        where.status = status;
    }

    const jobs = await prisma.jobListing.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(new ApiResponse(200, "Company jobs retrieved", jobs));
});