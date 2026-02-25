import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { ApiResponse, EmployerDashboardStats } from '../../lib/api'
import { useAuthGuard } from '../../hooks/useAuthGuard'
import { timeAgo } from '../../lib/utils'
import { STATUS_COLORS } from '../../lib/constants'

import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Plus,
  Building2,
  Clock,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/employer')({
  component: EmployerDashboard,
})





function EmployerDashboard() {
  const { isPending: authPending } = useAuthGuard('employer', { requireProfile: true })

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'employer'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<EmployerDashboardStats>>(
        '/api/v1/dashboard/employer'
      )
      return res.data.data
    },
  })

  if (authPending || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 bg-muted mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Active Jobs',
      value: stats?.overview?.activeJobs || 0,
      icon: Briefcase,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
    {
      label: 'Total Listings',
      value: stats?.overview?.totalJobs || 0,
      icon: FileText,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Applications',
      value: stats?.overview?.totalApplicationsReceived || 0,
      icon: Users,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
            <LayoutDashboard size={20} className="text-zinc-900" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Employer Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/jobs">
            <Button variant="outline" className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:text-teal-300">
              <Briefcase size={16} className="mr-2" />
              Manage Jobs
            </Button>
          </Link>
          <Link to="/jobs/create">
            <Button variant="outline" className="cursor-pointer">
              <Plus size={16} className="mr-2" />
              Post Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="border-border bg-card"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon size={18} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            Recent Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!stats?.recentApplications?.length ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No applications received yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentApplications.map((app: any) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {app.applicant?.name || 'Applicant'}
                    </p>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Building2 size={10} />
                      Applied for {app.jobListing?.title || 'Job'} ·{' '}
                      <Clock size={10} />
                      {timeAgo(app.createdAt)}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold ${STATUS_COLORS[app.status] || 'border-border text-muted-foreground'}`}
                  >
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
