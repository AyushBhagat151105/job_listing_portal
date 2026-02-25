import axios from 'axios'

const API_BASE = 'http://localhost:3000'

export const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Response interceptor to unwrap ApiResponse envelope
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message || error.message || 'Something went wrong'
        return Promise.reject(new Error(message))
    }
)

// Helper types matching the server ApiResponse shape
export interface ApiResponse<T = unknown> {
    success: boolean
    statusCode: number
    message: string
    data: T
    timestamp: string
}

// ─── Type Definitions ───────────────────────────────────────

export interface JobSeekerProfile {
    id: string
    userId: string
    headline?: string
    summary?: string
    phone?: string
    location?: string
    resumeUrl?: string
    skills?: string[]
    createdAt: string
    updatedAt: string
}

export interface EmployerProfile {
    id: string
    userId: string
    companyName: string
    companyLogo?: string
    industry?: string
    website?: string
    description?: string
    location?: string
    phone?: string
    createdAt: string
    updatedAt: string
}

export interface JobListing {
    id: string
    title: string
    description: string
    qualifications?: string
    responsibilities?: string
    location: string
    jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE'
    salaryMin?: number
    salaryMax?: number
    status: 'ACTIVE' | 'CLOSED' | 'DRAFT'
    employerProfileId: string
    employerProfile?: {
        companyName: string
        companyLogo?: string
        industry?: string
        website?: string
        description?: string
        location?: string
    }
    employer?: {
        companyName: string
        companyLogo?: string
        industry?: string
        website?: string
        description?: string
        location?: string
    }
    createdAt: string
    updatedAt: string
}

export interface JobApplication {
    id: string
    jobListingId: string
    jobId: string
    applicantId: string
    coverLetter?: string
    resumeUrl?: string
    status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED'
    matchScore?: number
    matchDetails?: string[]
    jobListing?: {
        title: string
        location: string
        jobType: string
        employerProfile?: {
            companyName: string
            companyLogo?: string
        }
    }
    job?: {
        title: string
        location: string
        jobType: string
        employer?: {
            companyName: string
            companyLogo?: string
        }
    }
    applicant?: {
        name: string
        email: string
        jobSeekerProfile?: {
            userId: string
            headline?: string
            location?: string
            skills?: string[]
        }
    }
    createdAt: string
    updatedAt: string
}

export interface SeekerDashboardStats {
    totalApplications: number
    pending: number
    reviewed: number
    shortlisted: number
    accepted: number
    rejected: number
    overview?: {
        totalApplications: number
        pending: number
        reviewed: number
        shortlisted: number
        accepted: number
        rejected: number
    }
    recentApplications: JobApplication[]
}

export interface EmployerDashboardStats {
    activeJobs: number
    totalJobs: number
    totalApplications: number
    overview?: {
        activeJobs: number
        totalJobs: number
        totalApplicationsReceived: number
    }
    recentApplications: JobApplication[]
}

export interface JobSearchParams {
    q?: string
    jobType?: string
    location?: string
    salaryMin?: number
    salaryMax?: number
    page?: number
    limit?: number
}

export interface PaginatedJobs {
    jobs: JobListing[]
    pagination: {
        totalItems: number
        currentPage: number
        pageSize: number
        totalPages: number
    }
}
