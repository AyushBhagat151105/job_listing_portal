import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import type { ApiResponse, JobSeekerProfile } from '../../lib/api'
import { useAuthGuard } from '../../hooks/useAuthGuard'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { User, Save, Loader2, Plus, X } from 'lucide-react'

export const Route = createFileRoute('/profile/seeker')({
  component: SeekerProfilePage,
})

const seekerProfileSchema = z.object({
  headline: z.string().max(200),
  summary: z.string().max(2000),
  phone: z.string().max(20),
  location: z.string().max(200),
  resumeUrl: z.string(),
})

function SeekerProfilePage() {
  const { isPending: authPending } = useAuthGuard('job_seeker')
  const queryClient = useQueryClient()
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [success, setSuccess] = useState('')
  const [serverError, setServerError] = useState('')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', 'seeker'],
    queryFn: async () => {
      try {
        const res = await api.get<ApiResponse<JobSeekerProfile>>(
          '/api/v1/profile/job-seeker'
        )
        return res.data.data
      } catch {
        return null
      }
    },
  })

  const form = useForm({
    defaultValues: {
      headline: '',
      summary: '',
      phone: '',
      location: '',
      resumeUrl: '',
    },
    validators: {
      onSubmit: seekerProfileSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError('')
      setSuccess('')
      try {
        const body = {
          headline: value.headline || undefined,
          summary: value.summary || undefined,
          phone: value.phone || undefined,
          location: value.location || undefined,
          resumeUrl: value.resumeUrl || undefined,
          skills: skills.length ? skills : undefined,
        }

        if (profile) {
          await api.put('/api/v1/profile/job-seeker', body)
        } else {
          await api.post('/api/v1/profile/job-seeker', body)
        }

        setSuccess('Profile saved successfully!')
        queryClient.invalidateQueries({ queryKey: ['profile', 'seeker'] })
        setTimeout(() => setSuccess(''), 3000)
      } catch (err: any) {
        setServerError(err.message || 'Failed to save profile')
      }
    },
  })

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      form.setFieldValue('headline', profile.headline || '')
      form.setFieldValue('summary', profile.summary || '')
      form.setFieldValue('phone', profile.phone || '')
      form.setFieldValue('location', profile.location || '')
      form.setFieldValue('resumeUrl', profile.resumeUrl || '')
      setSkills(profile.skills || [])
    }
  }, [profile])

  const addSkill = () => {
    const trimmed = newSkill.trim()
    if (trimmed && !skills.includes(trimmed) && skills.length < 30) {
      setSkills([...skills, trimmed])
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  if (authPending || isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
          <User size={20} className="text-zinc-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Job Seeker Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile ? 'Update your profile' : 'Create your profile'}
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
            {success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                {success}
              </div>
            )}
            {serverError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {serverError}
              </div>
            )}

            <form.Field name="headline">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-foreground">Headline</Label>
                  <Input
                    placeholder="e.g. Full Stack Developer"
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

            <form.Field name="summary">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-foreground">Summary</Label>
                  <Textarea
                    placeholder="Tell employers about yourself..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground resize-none"
                  />
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <form.Field name="phone">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-foreground">Phone</Label>
                    <Input
                      placeholder="+91-9876543210"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      maxLength={20}
                      className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="location">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-foreground">Location</Label>
                    <Input
                      placeholder="Mumbai, India"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      maxLength={200}
                      className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="resumeUrl">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-foreground">Resume URL</Label>
                  <Input
                    placeholder="https://example.com/resume.pdf"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-400">{field.state.meta.errors.join(', ')}</p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Skills (manual — not part of form schema since it's a tag input) */}
            <div className="space-y-2">
              <Label className="text-foreground">
                Skills <span className="text-muted-foreground">({skills.length}/30)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                  maxLength={50}
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSkill}
                  className="border-input text-foreground shrink-0 cursor-pointer"
                >
                  <Plus size={16} />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="text-xs bg-teal-500/10 text-teal-400 border-teal-500/30 pr-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1.5 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <form.Subscribe
              selector={(state) => [state.isSubmitting, state.canSubmit]}
            >
              {([isSubmitting, canSubmit]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-zinc-900 font-semibold shadow-lg shadow-teal-500/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  {profile ? 'Update Profile' : 'Create Profile'}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
