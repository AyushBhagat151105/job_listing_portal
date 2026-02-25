import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { ApiResponse, JobListing, EmployerProfile } from '../../lib/api'
import { useAuthGuard } from '../../hooks/useAuthGuard'
import { formatSalaryRange } from '../../lib/utils'
import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Skeleton } from '#/components/ui/skeleton'
import { Button } from '#/components/ui/button'
import { Briefcase, MapPin, Users, Plus, IndianRupee } from 'lucide-react'

export const Route = createFileRoute('/dashboard/jobs')({
    component: EmployerManageJobsPage,
})

function EmployerManageJobsPage() {
    const { isPending: authPending } = useAuthGuard('employer', { requireProfile: true })

    // First fetch the employer profile to get their ID
    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['profile', 'employer'],
        queryFn: async () => {
            try {
                const res = await api.get<ApiResponse<EmployerProfile>>(
                    '/api/v1/profile/employer'
                )
                return res.data.data
            } catch {
                return null
            }
        },
    })

    // Then fetch their jobs
    const { data: jobs, isLoading: isJobsLoading } = useQuery({
        queryKey: ['employer', 'jobs', profile?.id],
        queryFn: async () => {
            if (!profile?.id) return []
            const res = await api.get<ApiResponse<JobListing[]>>(
                `/api/v1/profile/company/${profile.id}/jobs`
            )
            return res.data.data
        },
        enabled: !!profile?.id,
    })

    if (authPending || isProfileLoading || isJobsLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
                <Skeleton className="h-10 w-64 bg-muted mb-8" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 bg-muted rounded-xl" />
                ))}
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                            <Briefcase size={20} className="text-zinc-900" />
                        </div>
                        Manage Jobs
                    </h1>
                    <p className="text-muted-foreground mt-2 ml-14">
                        View your job listings and manage applicant applications.
                    </p>
                </div>
                <Link to="/jobs/create">
                    <Button variant="outline" className="cursor-pointer">
                        <Plus size={16} className="mr-2" />
                        Post New Job
                    </Button>
                </Link>
            </div>

            {!profile ? (
                <Card className="border-amber-500/30 bg-amber-500/5 text-center py-12">
                    <CardContent className="space-y-4">
                        <h3 className="text-lg font-semibold text-amber-400">Employer Profile Required</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            You need to complete your company profile before you can manage jobs or applications.
                        </p>
                        <Link to="/profile/employer">
                            <Button className="bg-amber-500 hover:bg-amber-400 text-zinc-900">
                                Create Profile
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : !jobs?.length ? (
                <Card className="border-border bg-card text-center py-12">
                    <CardContent className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                            <Briefcase className="text-muted-foreground" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">No Job Listings Yet</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Create your first job listing to start receiving applications.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {jobs.map((job) => (
                        <Card key={job.id} className="border-border bg-card hover:bg-accent transition-colors">
                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                                            <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin size={14} />
                                                    {job.location}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <IndianRupee size={14} />
                                                    {formatSalaryRange(job.salaryMin, job.salaryMax)}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={
                                            job.status === 'ACTIVE' ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' :
                                                'border-border text-muted-foreground bg-muted'
                                        }>
                                            {job.status}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-3 md:pl-6 md:border-l border-border">
                                    <Link to="/jobs/$id/applicants" params={{ id: job.id }} className="w-full sm:w-auto">
                                        <Button variant="outline" className="w-full sm:w-auto border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:text-teal-300">
                                            <Users size={16} className="mr-2" />
                                            Manage Applicants
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
