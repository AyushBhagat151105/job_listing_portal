import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { ApiResponse, JobApplication } from '../lib/api'
import { useAuthGuard } from '../hooks/useAuthGuard'

import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Skeleton } from '#/components/ui/skeleton'
import { FileText, MapPin, Building2, Clock } from 'lucide-react'

export const Route = createFileRoute('/applications')({
  component: ApplicationsPage,
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
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function ApplicationsPage() {
  const { isPending: authPending } = useAuthGuard('job_seeker')

  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<JobApplication[]>>(
        '/api/v1/applications/my'
      )
      return res.data.data
    },
  })

  if (authPending || isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 bg-zinc-800 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
          <FileText size={20} className="text-zinc-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">My Applications</h1>
          <p className="text-sm text-zinc-400">
            {applications?.length || 0} application
            {applications?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {!applications?.length ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">
            No applications yet
          </h3>
          <p className="text-zinc-500 text-sm mb-6">
            Start browsing jobs and apply to positions that interest you.
          </p>
          <Link
            to="/"
            className="text-teal-400 hover:text-teal-300 text-sm font-medium"
          >
            Browse Jobs →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card
              key={app.id}
              className="border-zinc-800/60 bg-zinc-900/60 hover:border-zinc-700/60 transition-colors"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <Link
                        to="/jobs/$id"
                        params={{ id: app.jobListingId }}
                        className="text-base font-semibold text-zinc-200 hover:text-teal-400 transition-colors truncate"
                      >
                        {app.jobListing?.title || 'Job Title'}
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Building2 size={12} />
                        {app.jobListing?.employerProfile?.companyName || 'Company'}
                      </span>
                      {app.jobListing?.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} />
                          {app.jobListing.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-zinc-500">
                        <Clock size={12} />
                        {timeAgo(app.createdAt)}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold shrink-0 ${STATUS_COLORS[app.status] || 'border-zinc-700 text-zinc-400'}`}
                  >
                    {app.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
