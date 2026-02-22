import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import type { ValidatedRequest } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiRespons";
import { calculateMatchScore } from "../utils/matchingAlgorithm";
import type { z } from "zod/v4";

import {
    createApplicationSchema,
    updateApplicationStatusSchema,
    idParamSchema,
    jobIdParamSchema,
} from "../validators/schemas";

// ─── Job Seeker: Apply to Job ───────────────────────────────

export const applyForJob = asyncHandler(async (req: ValidatedRequest<typeof createApplicationSchema>, res: Response) => {
    const user = req.user.id;
    const { jobListingId, coverLetter, resumeUrl } = req.body;

    // Verify the user has a job seeker profile
    const profile = await prisma.jobSeekerProfile.findUnique({
        where: { userId: user }
    });

    if (!profile) {
        throw new ApiError(403, "You must create a job seeker profile before applying to jobs");
    }

    // Verify the job exists and is active
    const job = await prisma.jobListing.findUnique({
        where: { id: jobListingId }
    });

    if (!job) {
        throw new ApiError(404, "Job listing not found");
    }

    if (job.status !== "ACTIVE") {
        throw new ApiError(400, "This job is no longer accepting applications");
    }

    // Prevent duplicate applications
    const existingApplication = await prisma.jobApplication.findFirst({
        where: {
            jobListingId,
            applicantId: user
        }
    });

    if (existingApplication) {
        throw new ApiError(409, "You have already applied for this job");
    }

    const application = await prisma.jobApplication.create({
        data: {
            jobListingId,
            applicantId: user,
            coverLetter,
            resumeUrl: resumeUrl || profile.resumeUrl, // Fallback to profile resume if not provided
            status: "PENDING"
        }
    });

    return res.status(201).json(new ApiResponse(201, "Application submitted successfully", application));
});

// ─── Job Seeker: List My Applications ───────────────────────

export const getMyApplications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user.id;

    const profile = await prisma.jobSeekerProfile.findUnique({
        where: { userId: user }
    });

    if (!profile) {
        throw new ApiError(404, "Job seeker profile not found");
    }

    const applications = await prisma.jobApplication.findMany({
        where: { applicantId: user },
        include: {
            jobListing: {
                select: {
                    title: true,
                    location: true,
                    jobType: true,
                    employerProfile: {
                        select: {
                            companyName: true,
                            companyLogo: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(new ApiResponse(200, "Applications retrieved successfully", applications));
});

// ─── Employer: List Applications For Job ────────────────────

export const getJobApplications = asyncHandler(async (req: ValidatedRequest<z.ZodTypeAny, z.ZodTypeAny, typeof jobIdParamSchema>, res: Response) => {
    const user = req.user.id;
    const { jobId } = req.params;

    const employerProfile = await prisma.employerProfile.findUnique({
        where: { userId: user }
    });

    if (!employerProfile) {
        throw new ApiError(403, "Employer profile not found");
    }

    // Verify ownership of the job
    const job = await prisma.jobListing.findUnique({
        where: { id: jobId }
    });

    if (!job) {
        throw new ApiError(404, "Job listing not found");
    }

    if (job.employerProfileId !== employerProfile.id) {
        throw new ApiError(403, "You do not have permission to view these applications");
    }

    const applications = await prisma.jobApplication.findMany({
        where: { jobListingId: jobId },
        include: {
            applicant: {
                select: {
                    name: true,
                    email: true,
                    jobSeekerProfile: {
                        select: {
                            headline: true,
                            location: true,
                            skills: true,
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // --- Applicant Matching Algorithm ---
    const scoredApplications = applications.map(app => {
        const profile = app.applicant.jobSeekerProfile;

        // Use the pure testing-friendly abstracted function
        const { matchScore, matchDetails } = calculateMatchScore(job, profile);

        return {
            ...app,
            matchScore,
            matchDetails
        };
    });

    // Sort applicants by their score descending
    scoredApplications.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json(new ApiResponse(200, "Applications retrieved and scored successfully", scoredApplications));
});

// ─── Employer: Update Application Status ────────────────────

export const updateApplicationStatus = asyncHandler(async (req: ValidatedRequest<typeof updateApplicationStatusSchema, z.ZodTypeAny, typeof idParamSchema>, res: Response) => {
    const user = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const employerProfile = await prisma.employerProfile.findUnique({
        where: { userId: user }
    });

    if (!employerProfile) {
        throw new ApiError(403, "Employer profile not found");
    }

    // Verify the application exists and belongs to one of their jobs
    const application = await prisma.jobApplication.findUnique({
        where: { id },
        include: {
            jobListing: {
                select: {
                    employerProfileId: true
                }
            }
        }
    });

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    if (application.jobListing.employerProfileId !== employerProfile.id) {
        throw new ApiError(403, "You do not have permission to modify this application");
    }

    const updatedApplication = await prisma.jobApplication.update({
        where: { id },
        data: { status }
    });

    return res.status(200).json(new ApiResponse(200, "Application status updated successfully", updatedApplication));
});
