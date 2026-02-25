import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { ApiResponse, JobListing, JobApplication } from '../../../lib/api'
import { useAuthGuard } from '../../../hooks/useAuthGuard'

import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  Users,
  MapPin,
  Star,
  ArrowLeft,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/jobs/$id/applicants')({
  component: ApplicantsPage,
})

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  REVIEWED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  SHORTLISTED: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/30',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

function ApplicantsPage() {
  const { isPending: authPending } = useAuthGuard('employer')
  const { id } = Route.useParams()
  const queryClient = useQueryClient()

  const { data: job } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<JobListing>>(`/api/v1/jobs/${id}`)
      return res.data.data
    },
  })

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applicants', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<JobApplication[]>>(
        `/api/v1/applications/job/${id}`
      )
      return res.data.data
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      applicationId,
      status,
    }: {
      applicationId: string
      status: string
    }) => {
      await api.patch(`/api/v1/applications/${applicationId}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants', id] })
    },
  })

  if (authPending || isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 bg-zinc-800 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/dashboard/employer"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-teal-400 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
          <Users size={20} className="text-zinc-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Applicants</h1>
          <p className="text-sm text-zinc-400">
            {job?.title || 'Job'} — {applications?.length || 0} applicant
            {applications?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {!applications?.length ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">
            No applicants yet
          </h3>
          <p className="text-zinc-500 text-sm">
            Share your job listing to attract candidates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card
              key={app.id}
              className="border-zinc-800/60 bg-zinc-900/60"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-zinc-200 hover:text-teal-400 transition-colors">
                      <Link to="/applicant/$id" params={{ id: app.applicant?.jobSeekerProfile?.userId || '' }}>
                        {app.applicant?.name || 'Applicant'}
                      </Link>
                    </h3>
                    <p className="text-sm text-zinc-500">
                      {app.applicant?.email}
                    </p>
                    {app.applicant?.jobSeekerProfile?.headline && (
                      <p className="text-sm text-zinc-400 mt-1">
                        {app.applicant.jobSeekerProfile.headline}
                      </p>
                    )}
                    {app.applicant?.jobSeekerProfile?.location && (
                      <span className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                        <MapPin size={10} />
                        {app.applicant.jobSeekerProfile.location}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {app.matchScore != null && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Star size={14} className="text-amber-400" />
                        <span className="font-semibold text-zinc-200">
                          {app.matchScore}%
                        </span>
                        <span className="text-zinc-500 text-xs">match</span>
                      </div>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${STATUS_COLORS[app.status] || 'border-zinc-700 text-zinc-400'}`}
                    >
                      {app.status}
                    </Badge>
                  </div>
                </div>

                {/* Skills */}
                {app.applicant?.jobSeekerProfile?.skills?.length ? (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {app.applicant.jobSeekerProfile.skills
                      .slice(0, 6)
                      .map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-[10px] bg-zinc-800/50 text-zinc-400 border-zinc-700"
                        >
                          {skill}
                        </Badge>
                      ))}
                    {app.applicant.jobSeekerProfile.skills.length > 6 && (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-zinc-800/50 text-zinc-500 border-zinc-700"
                      >
                        +{app.applicant.jobSeekerProfile.skills.length - 6}
                      </Badge>
                    )}
                  </div>
                ) : null}

                {app.coverLetter && (
                  <p className="text-sm text-zinc-400 bg-zinc-800/30 rounded-lg p-3 mb-4 leading-relaxed">
                    {app.coverLetter}
                  </p>
                )}

                {(app.resumeUrl || (app.matchDetails && app.matchDetails.length > 0)) && (
                  <div className="flex flex-col gap-3 mb-4">
                    {app.resumeUrl && (
                      <div>
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 bg-teal-500/10 px-3 py-1.5 rounded-md transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                          View Resume
                        </a>
                      </div>
                    )}

                    {app.matchDetails && app.matchDetails.length > 0 && (
                      <div className="space-y-1.5 p-3 rounded-lg bg-zinc-800/20 border border-zinc-800/50">
                        <p className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                          <Star size={12} className="text-amber-400" />
                          Match Insights
                        </p>
                        <ul className="text-xs text-zinc-400 space-y-1 pl-4 list-disc">
                          {app.matchDetails.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    Applied {timeAgo(app.createdAt)}
                  </span>

                  <Select
                    value={app.status}
                    onValueChange={(val) =>
                      updateStatusMutation.mutate({
                        applicationId: app.id,
                        status: val,
                      })
                    }
                  >
                    <SelectTrigger className="w-36 h-8 text-xs bg-zinc-800/50 border-zinc-700 text-zinc-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="REVIEWED">Reviewed</SelectItem>
                      <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
