import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState } from 'react'
import { timeAgo, formatSalaryRange } from '../../../lib/utils'
import { JOB_TYPE_LABELS } from '../../../lib/constants'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '#/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog'
import {
  MapPin,
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
  const role = (user as typeof user & { role?: string })?.role as string | undefined

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
        <Skeleton className="h-8 w-64 bg-muted mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 bg-muted rounded-xl" />
            <Skeleton className="h-32 bg-muted rounded-xl" />
          </div>
          <Skeleton className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Job not found
        </h2>
        <Link to="/" className="text-teal-400 hover:text-teal-300 text-sm">
          ← Back to jobs
        </Link>
      </div>
    )
  }

  const company = job.employerProfile || job.employer;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-teal-400 transition-colors mb-6"
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
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {job.title}
                </h1>
                <p className="text-muted-foreground">
                  {company?.companyName || 'Company'}
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
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin size={14} />
                {job.location}
              </div>
              {(job.salaryMin || job.salaryMax) && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <IndianRupee size={14} />
                  {formatSalaryRange(job.salaryMin, job.salaryMax)}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
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
                    variant="outline"
                    className="cursor-pointer"
                  >
                    <Send size={16} className="mr-2" />
                    Apply Now
                  </Button>
                )
              ) : !user ? (
                <Link
                  to="/sign-in"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors text-sm"
                >
                  <LogIn size={16} />
                  Sign in to apply
                </Link>
              ) : null}
            </div>
          </div>

          {/* Description */}
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Description
              </h2>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
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
                <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
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
                <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
                  {job.responsibilities}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — Company Info */}
        <div className="space-y-6">
          <Card className="border-border bg-card sticky top-20">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-6 uppercase tracking-wider">
                About the Company
              </h3>

              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16 rounded-xl border border-border bg-muted/50">
                  <AvatarImage src={company?.companyLogo || ''} alt={company?.companyName || 'Company'} className="object-cover" />
                  <AvatarFallback className="rounded-xl text-lg font-semibold bg-teal-500/10 text-teal-500">
                    {(company?.companyName || 'C').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-lg text-foreground">
                    {company?.companyName || 'Company'}
                  </h4>
                  {company?.industry && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {company.industry}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {company?.location && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-foreground leading-tight">{company.location}</span>
                  </div>
                )}

                {company?.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe size={16} className="text-muted-foreground shrink-0" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:text-teal-300 truncate font-medium transition-colors"
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {company?.description && (
                  <div className="pt-4 border-t border-border/60">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {company.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Apply Dialog with TanStack Form */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="bg-popover border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-popover-foreground">
              Apply for {job.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Submit your application to {company?.companyName || 'the company'}
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
                {applyMutation.error instanceof Error ? applyMutation.error.message : 'Failed to submit application'}
              </div>
            )}

            <applyForm.Field name="coverLetter">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-popover-foreground">Cover Letter</Label>
                  <Textarea
                    placeholder="Why are you a great fit?"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground resize-none"
                  />
                </div>
              )}
            </applyForm.Field>

            <applyForm.Field name="resumeUrl">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-popover-foreground">Resume URL</Label>
                  <Input
                    placeholder="https://example.com/resume.pdf"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
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
