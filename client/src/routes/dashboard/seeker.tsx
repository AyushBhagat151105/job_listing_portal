import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { ApiResponse, SeekerDashboardStats } from '../../lib/api'
import { useAuthGuard } from '../../hooks/useAuthGuard'

import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Skeleton } from '#/components/ui/skeleton'
import {
  LayoutDashboard,
  FileText,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Star,
  Building2,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/seeker')({
  component: SeekerDashboard,
})

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  REVIEWED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  SHORTLISTED: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/30',
}

function SeekerDashboard() {
  const { isPending: authPending } = useAuthGuard('job_seeker')

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'seeker'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SeekerDashboardStats>>(
        '/api/v1/dashboard/seeker'
      )
      return res.data.data
    },
  })

  if (authPending || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 bg-zinc-800 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Applied',
      value: stats?.overview?.totalApplications || 0,
      icon: FileText,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
    {
      label: 'Pending',
      value: stats?.overview?.pending || 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Reviewed',
      value: stats?.overview?.reviewed || 0,
      icon: Eye,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Shortlisted',
      value: stats?.overview?.shortlisted || 0,
      icon: Star,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Accepted',
      value: stats?.overview?.accepted || 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Rejected',
      value: stats?.overview?.rejected || 0,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
          <LayoutDashboard size={20} className="text-zinc-900" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
              <p className="text-zinc-500 text-sm">No applications yet.</p>
              <Link
                to="/"
                className="text-teal-400 hover:text-teal-300 text-sm mt-2 inline-block"
              >
                Browse Jobs →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentApplications.map((app: any) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/jobs/$id"
                      params={{ id: app.jobListingId }}
                      className="text-sm font-medium text-zinc-200 hover:text-teal-400 truncate block"
                    >
                      {app.jobListing?.title || 'Job'}
                    </Link>
                    <span className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <Building2 size={10} />
                      {app.jobListing?.employerProfile?.companyName || 'Company'} ·{' '}
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
