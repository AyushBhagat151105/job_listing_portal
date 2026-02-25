import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { ApiResponse, JobApplication } from '../lib/api'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { timeAgo } from '../lib/utils'
import { STATUS_COLORS } from '../lib/constants'

import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Skeleton } from '#/components/ui/skeleton'
import { FileText, MapPin, Building2, Clock } from 'lucide-react'

export const Route = createFileRoute('/applications')({
  component: ApplicationsPage,
})





function ApplicationsPage() {
  const { isPending: authPending } = useAuthGuard('job_seeker', { requireProfile: true })

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
        <Skeleton className="h-8 w-48 bg-muted mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 bg-muted rounded-xl" />
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
          <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
          <p className="text-sm text-muted-foreground">
            {applications?.length || 0} application
            {applications?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {!applications?.length ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No applications yet
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
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
              className="border-border bg-card hover:border-border/80 transition-colors"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <Link
                        to="/jobs/$id"
                        params={{ id: app.jobListingId }}
                        className="text-base font-semibold text-foreground hover:text-teal-400 transition-colors truncate"
                      >
                        {app.jobListing?.title || 'Job Title'}
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock size={12} />
                        {timeAgo(app.createdAt)}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold shrink-0 ${STATUS_COLORS[app.status] || 'border-border text-muted-foreground'}`}
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
