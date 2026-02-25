import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../lib/api'
import type { ApiResponse, PaginatedJobs } from '../lib/api'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Badge } from '#/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
} from '#/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Search,
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: HomePage })

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  REMOTE: 'Remote',
}

const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  PART_TIME: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  CONTRACT: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  INTERNSHIP: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  REMOTE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

function formatSalary(amount?: number) {
  if (!amount) return null
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
  return `₹${amount}`
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

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState<string>('')
  const [page, setPage] = useState(1)
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [submittedLocation, setSubmittedLocation] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', submittedSearch, submittedLocation, jobType, page],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: 12 }
      if (submittedSearch) params.q = submittedSearch
      if (submittedLocation) params.location = submittedLocation
      if (jobType && jobType !== 'ALL') params.jobType = jobType
      const res = await api.get<ApiResponse<PaginatedJobs>>('/api/v1/jobs', { params })
      return res.data.data
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittedSearch(searchQuery)
    setSubmittedLocation(location)
    setPage(1)
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium">
              <Sparkles size={14} />
              Your career starts here
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Find your{' '}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                dream job
              </span>
            </h1>

            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Browse thousands of opportunities from top companies. Apply with
              one click and track every application in real-time.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-8"
            >
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <Input
                  placeholder="Job title or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-zinc-800/60 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-teal-500"
                />
              </div>
              <div className="relative flex-1 sm:max-w-[200px]">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <Input
                  placeholder="Location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-12 bg-zinc-800/60 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-teal-500"
                />
              </div>
              <Button
                type="submit"
                className="h-12 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-zinc-900 font-semibold shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                <Search size={18} className="mr-2" />
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Filter + Job Listings */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-zinc-100">
              {data?.pagination?.totalItems !== undefined
                ? `${data.pagination.totalItems} Jobs`
                : 'Jobs'}
            </h2>

            {(submittedSearch || submittedLocation || (jobType && jobType !== 'ALL')) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setLocation('')
                  setJobType('')
                  setSubmittedSearch('')
                  setSubmittedLocation('')
                  setPage(1)
                }}
                className="text-zinc-400 hover:text-zinc-100 text-xs cursor-pointer"
              >
                Clear filters
              </Button>
            )}
          </div>

          <Select
            value={jobType}
            onValueChange={(val) => {
              setJobType(val)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px] bg-zinc-800/60 border-zinc-700 text-zinc-300">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="FULL_TIME">Full Time</SelectItem>
              <SelectItem value="PART_TIME">Part Time</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
              <SelectItem value="INTERNSHIP">Internship</SelectItem>
              <SelectItem value="REMOTE">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="border-zinc-800/60 bg-zinc-900/60"
              >
                <CardHeader className="space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-zinc-800" />
                  <Skeleton className="h-4 w-1/2 bg-zinc-800" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full bg-zinc-800" />
                  <Skeleton className="h-4 w-2/3 bg-zinc-800" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 bg-zinc-800 rounded-full" />
                    <Skeleton className="h-6 w-24 bg-zinc-800 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.jobs?.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
              <Briefcase size={32} className="text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-300 mb-2">
              No jobs found
            </h3>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              Try adjusting your search filters or check back later for new
              opportunities.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.jobs?.map((job) => (
                <Link
                  key={job.id}
                  to="/jobs/$id"
                  params={{ id: job.id }}
                  className="group"
                >
                  <Card className="border-zinc-800/60 bg-zinc-900/60 hover:bg-zinc-800/60 hover:border-zinc-700/60 transition-all duration-200 h-full cursor-pointer group-hover:shadow-lg group-hover:shadow-teal-500/5">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-zinc-100 group-hover:text-teal-400 transition-colors truncate">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1 text-sm text-zinc-400">
                            <Building2 size={14} className="shrink-0" />
                            <span className="truncate">
                              {job.employerProfile?.companyName || 'Company'}
                            </span>
                          </div>
                        </div>
                        <ArrowRight
                          size={16}
                          className="text-zinc-600 group-hover:text-teal-400 transition-colors shrink-0 mt-1"
                        />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {job.location}
                        </span>
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="flex items-center gap-1">
                            <IndianRupee size={12} />
                            {formatSalary(job.salaryMin)}
                            {job.salaryMin && job.salaryMax && ' – '}
                            {formatSalary(job.salaryMax)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${JOB_TYPE_COLORS[job.jobType] || 'border-zinc-700 text-zinc-400'}`}
                        >
                          {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                        </Badge>
                        <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                          <Clock size={10} />
                          {timeAgo(job.createdAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </Button>

                {Array.from(
                  { length: Math.min(data.pagination.totalPages, 5) },
                  (_, i) => {
                    let pageNum: number
                    const total = data.pagination.totalPages
                    if (total <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= total - 2) {
                      pageNum = total - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={
                          page === pageNum
                            ? 'bg-teal-500 text-zinc-900 hover:bg-teal-400 cursor-pointer'
                            : 'border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer'
                        }
                      >
                        {pageNum}
                      </Button>
                    )
                  }
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) =>
                      Math.min(data.pagination.totalPages, p + 1)
                    )
                  }
                  disabled={page === data.pagination.totalPages}
                  className="border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
