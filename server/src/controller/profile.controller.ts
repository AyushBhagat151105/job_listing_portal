import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";
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