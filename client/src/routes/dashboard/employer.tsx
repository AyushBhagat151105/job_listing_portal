import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { ApiResponse, EmployerDashboardStats } from '../../lib/api'
import { useAuthGuard } from '../../hooks/useAuthGuard'

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

function EmployerDashboard() {
  const { isPending: authPending } = useAuthGuard('employer')

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
        <Skeleton className="h-8 w-48 bg-zinc-800 mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 bg-zinc-800 rounded-xl" />
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
          <h1 className="text-2xl font-bold text-zinc-100">
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
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-zinc-900 font-semibold shadow-lg shadow-teal-500/20 cursor-pointer">
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
            className="border-zinc-800/60 bg-zinc-900/60"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon size={18} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">
                  {stat.value}
                </p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <Card className="border-zinc-800/60 bg-zinc-900/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-zinc-200">
            Recent Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!stats?.recentApplications?.length ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 text-sm">
                No applications received yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentApplications.map((app: any) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">
                      {app.applicant?.name || 'Applicant'}
                    </p>
                    <span className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <Building2 size={10} />
                      Applied for {app.jobListing?.title || 'Job'} ·{' '}
                      <Clock size={10} />
                      {timeAgo(app.createdAt)}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold ${STATUS_COLORS[app.status] || 'border-zinc-700 text-zinc-400'}`}
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
