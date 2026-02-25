import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState } from 'react'


import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog'
import {
  MapPin,
  Building2,
  Clock,
  IndianRupee,
  ArrowLeft,
  Briefcase,
  Globe,
  Send,
  Loader2,
  LogIn,
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { api, type ApiResponse, type JobListing } from '@/lib/api'

export const Route = createFileRoute('/jobs/$id/')({
  component: JobDetailsPage,
})

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  REMOTE: 'Remote',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

const applySchema = z.object({
  coverLetter: z.string().max(2000),
  resumeUrl: z.string(),
})

function JobDetailsPage() {
  const { id } = Route.useParams()
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()
  const [applyOpen, setApplyOpen] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)

  const user = session?.user
  const role = (user as any)?.role as string | undefined

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<JobListing>>(`/api/v1/jobs/${id}`)
      return res.data.data
    },
  })

  const applyMutation = useMutation({
    mutationFn: async (values: { coverLetter?: string; resumeUrl?: string }) => {
      await api.post(`/api/v1/applications`, {
        jobListingId: id,
        coverLetter: values.coverLetter || undefined,
        resumeUrl: values.resumeUrl || undefined,
      })
    },
    onSuccess: () => {
      setApplyOpen(false)
      setApplySuccess(true)
      queryClient.invalidateQueries({ queryKey: ['job', id] })
    },
  })

  const applyForm = useForm({
    defaultValues: { coverLetter: '', resumeUrl: '' },
    validators: { onSubmit: applySchema },
    onSubmit: async ({ value }) => {
      await applyMutation.mutateAsync(value)
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 bg-zinc-800 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 bg-zinc-800 rounded-xl" />
            <Skeleton className="h-32 bg-zinc-800 rounded-xl" />
          </div>
          <Skeleton className="h-64 bg-zinc-800 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-zinc-300 mb-2">
          Job not found
        </h2>
        <Link to="/" className="text-teal-400 hover:text-teal-300 text-sm">
          ← Back to jobs
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-teal-400 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Jobs
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0">
                <Briefcase size={24} className="text-zinc-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-100 mb-1">
                  {job.title}
                </h1>
                <p className="text-zinc-400">
                  {job.employer?.companyName || 'Company'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <Badge
                variant="outline"
                className="bg-teal-500/10 text-teal-400 border-teal-500/30"
              >
                {JOB_TYPE_LABELS[job.jobType] || job.jobType}
              </Badge>
              <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                <MapPin size={14} />
                {job.location}
              </div>
              {(job.salaryMin || job.salaryMax) && (
                <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <IndianRupee size={14} />
                  {job.salaryMin && job.salaryMax
                    ? `₹${(job.salaryMin / 100000).toFixed(1)}L – ₹${(job.salaryMax / 100000).toFixed(1)}L`
                    : job.salaryMin
                      ? `From ₹${(job.salaryMin / 100000).toFixed(1)}L`
                      : `Up to ₹${(job.salaryMax! / 100000).toFixed(1)}L`}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                <Clock size={14} />
                Posted {timeAgo(job.createdAt)}
              </div>
            </div>

            {/* Apply Button */}
            <div className="mb-6">
              {user && role === 'job_seeker' ? (
                applySuccess ? (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                    ✓ Application submitted successfully!
                  </div>
                ) : (
                  <Button
                    onClick={() => setApplyOpen(true)}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-zinc-900 font-semibold shadow-lg shadow-teal-500/20 cursor-pointer"
                  >
                    <Send size={16} className="mr-2" />
                    Apply Now
                  </Button>
                )
              ) : !user ? (
                <Link
                  to="/sign-in"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm"
                >
                  <LogIn size={16} />
                  Sign in to apply
                </Link>
              ) : null}
            </div>
          </div>

          {/* Description */}
          <Card className="border-zinc-800/60 bg-zinc-900/60">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-zinc-200 mb-3">
                Description
              </h2>
              <p className="text-zinc-400 text-sm whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {job.qualifications && (
            <Card className="border-zinc-800/60 bg-zinc-900/60">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-zinc-200 mb-3">
                  Qualifications
                </h2>
                <p className="text-zinc-400 text-sm whitespace-pre-wrap leading-relaxed">
                  {job.qualifications}
                </p>
              </CardContent>
            </Card>
          )}

          {job.responsibilities && (
            <Card className="border-zinc-800/60 bg-zinc-900/60">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-zinc-200 mb-3">
                  Responsibilities
                </h2>
                <p className="text-zinc-400 text-sm whitespace-pre-wrap leading-relaxed">
                  {job.responsibilities}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — Company Info */}
        <div>
          <Card className="border-zinc-800/60 bg-zinc-900/60 sticky top-20">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
                About the Company
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 size={14} className="text-zinc-500" />
                  <span className="text-zinc-300">
                    {job.employer?.companyName || 'Company'}
                  </span>
                </div>
                {job.employer?.industry && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase size={14} className="text-zinc-500" />
                    <span className="text-zinc-400">{job.employer.industry}</span>
                  </div>
                )}
                {job.employer?.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} className="text-zinc-500" />
                    <span className="text-zinc-400">{job.employer.location}</span>
                  </div>
                )}
                {job.employer?.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe size={14} className="text-zinc-500" />
                    <a
                      href={job.employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:text-teal-300 truncate"
                    >
                      {job.employer.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {job.employer?.description && (
                  <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-800/60 leading-relaxed">
                    {job.employer.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Apply Dialog with TanStack Form */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              Apply for {job.title}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Submit your application to {job.employer?.companyName}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              applyForm.handleSubmit()
            }}
            className="space-y-4 mt-4"
          >
            {applyMutation.isError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {(applyMutation.error as any)?.message || 'Failed to submit application'}
              </div>
            )}

            <applyForm.Field name="coverLetter">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-zinc-300">Cover Letter</Label>
                  <Textarea
                    placeholder="Why are you a great fit?"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 resize-none"
                  />
                </div>
              )}
            </applyForm.Field>

            <applyForm.Field name="resumeUrl">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-zinc-300">Resume URL</Label>
                  <Input
                    placeholder="https://example.com/resume.pdf"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-400">{field.state.meta.errors.join(", ")}</p>
                  )}
                </div>
              )}
            </applyForm.Field>

            <applyForm.Subscribe
              selector={(state) => [state.isSubmitting, state.canSubmit]}
            >
              {([isSubmitting, canSubmit]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-zinc-900 font-semibold cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : (
                    <Send size={16} className="mr-2" />
                  )}
                  Submit Application
                </Button>
              )}
            </applyForm.Subscribe>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
