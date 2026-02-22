import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiRespons";

// ─── Job Seeker Dashboard ───────────────────────────────────

export const getSeekerDashboardStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user.id;

    const profile = await prisma.jobSeekerProfile.findUnique({
        where: { userId: user }
    });

    if (!profile) {
        throw new ApiError(404, "Job seeker profile not found");
    }

    // Get all applications for this user
    const applications = await prisma.jobApplication.findMany({
        where: { applicantId: user },
        select: { status: true }
    });

    const totalApplications = applications.length;

    const applicationsByStatus = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Get recently applied jobs
    const recentApplications = await prisma.jobApplication.findMany({
        where: { applicantId: user },
        include: {
            jobListing: {
                select: {
                    title: true,
                    employerProfile: {
                        select: { companyName: true, companyLogo: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    return res.status(200).json(new ApiResponse(200, "Dashboard stats retrieved successfully", {
        overview: {
            totalApplications,
            pending: applicationsByStatus['PENDING'] || 0,
            reviewed: applicationsByStatus['REVIEWED'] || 0,
            shortlisted: applicationsByStatus['SHORTLISTED'] || 0,
            accepted: applicationsByStatus['ACCEPTED'] || 0,
            rejected: applicationsByStatus['REJECTED'] || 0,
        },
        recentApplications
    }));
});


// ─── Employer Dashboard ─────────────────────────────────────

export const getEmployerDashboardStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user.id;

    const profile = await prisma.employerProfile.findUnique({
        where: { userId: user }
    });

    if (!profile) {
        throw new ApiError(404, "Employer profile not found");
    }

    // Get all jobs posted by this employer
    const jobs = await prisma.jobListing.findMany({
        where: { employerProfileId: profile.id },
        include: {
            _count: {
                select: { applications: true }
            }
        }
    });

    const activeJobs = jobs.filter(job => job.status === "ACTIVE").length;
    const totalJobs = jobs.length;

    const totalApplicationsReceived = jobs.reduce((sum, job) => sum + job._count.applications, 0);

    // Get recent applications across all their jobs
    const recentApplications = await prisma.jobApplication.findMany({
        where: {
            jobListing: {
                employerProfileId: profile.id
            }
        },
        include: {
            jobListing: { select: { title: true } },
            applicant: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    return res.status(200).json(new ApiResponse(200, "Dashboard stats retrieved successfully", {
        overview: {
            activeJobs,
            totalJobs,
            totalApplicationsReceived,
        },
        recentApplications
    }));
});
