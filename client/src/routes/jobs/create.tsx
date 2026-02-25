import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState } from 'react'
import { api } from '../../lib/api'
import { useAuthGuard } from '../../hooks/useAuthGuard'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Card, CardContent } from '#/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Plus, Loader2, Briefcase } from 'lucide-react'

export const Route = createFileRoute('/jobs/create')({
  component: CreateJobPage,
})

const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  qualifications: z.string().max(3000),
  responsibilities: z.string().max(3000),
  location: z.string().min(1, 'Location is required').max(200),
  jobType: z.enum([
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'INTERNSHIP',
    'REMOTE',
  ]),
  salaryMin: z.union([z.number().min(0), z.undefined()]),
  salaryMax: z.union([z.number().min(0), z.undefined()]),
})

function CreateJobPage() {
  useAuthGuard('employer', { requireProfile: true })
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      qualifications: '',
      responsibilities: '',
      location: '',
      jobType: 'FULL_TIME' as
        | 'FULL_TIME'
        | 'PART_TIME'
        | 'CONTRACT'
        | 'INTERNSHIP'
        | 'REMOTE',
      salaryMin: undefined as number | undefined,
      salaryMax: undefined as number | undefined,
    },
    validators: {
      onSubmit: createJobSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError('')
      try {
        await api.post('/api/v1/jobs', {
          title: value.title,
          description: value.description,
          qualifications: value.qualifications || undefined,
          responsibilities: value.responsibilities || undefined,
          location: value.location,
          jobType: value.jobType,
          salaryMin: value.salaryMin || undefined,
          salaryMax: value.salaryMax || undefined,
        })
        navigate({ to: '/dashboard/employer' })
      } catch (err: any) {
        setServerError(err.message || 'Failed to create job listing')
      }
    },
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
          <Briefcase size={20} className="text-zinc-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Post a Job</h1>
          <p className="text-sm text-muted-foreground">
            Create a new job listing for your company
          </p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-5"
          >
            {serverError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {serverError}
              </div>
            )}

            <form.Field name="title">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-foreground">
                    Job Title <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    placeholder="Senior React Developer"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    maxLength={200}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-400">{field.state.meta.errors.join(', ')}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-foreground">
                    Description <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    placeholder="Describe the role, what the candidate will be working on..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    maxLength={5000}
                    rows={5}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground resize-none"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-400">{field.state.meta.errors.join(', ')}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="qualifications">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-foreground">Qualifications</Label>
                  <Textarea
                    placeholder="Required qualifications and experience..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    maxLength={3000}
                    rows={3}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground resize-none"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="responsibilities">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-foreground">Responsibilities</Label>
                  <Textarea
                    placeholder="Key responsibilities and duties..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    maxLength={3000}
                    rows={3}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground resize-none"
                  />
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <form.Field name="location">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Location <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      placeholder="Mumbai, India"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      maxLength={200}
                      className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-red-400">{field.state.meta.errors.join(', ')}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="jobType">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Job Type <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) =>
                        field.handleChange(val as any)
                      }
                    >
                      <SelectTrigger className="bg-background border-input text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                        <SelectItem value="INTERNSHIP">Internship</SelectItem>
                        <SelectItem value="REMOTE">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <form.Field name="salaryMin">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Salary Min <span className="text-zinc-500">(₹/year)</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="800000"
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      min={0}
                      className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="salaryMax">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Salary Max <span className="text-zinc-500">(₹/year)</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="1500000"
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      min={0}
                      className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-red-400">{field.state.meta.errors.join(', ')}</p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            <form.Subscribe
              selector={(state) => [state.isSubmitting, state.canSubmit]}
            >
              {([isSubmitting, canSubmit]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  variant="outline"
                  className="w-full cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : (
                    <Plus size={16} className="mr-2" />
                  )}
                  Create Job Listing
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
