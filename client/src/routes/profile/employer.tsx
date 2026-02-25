import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import type { ApiResponse, EmployerProfile } from '../../lib/api'
import { useAuthGuard } from '../../hooks/useAuthGuard'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Card, CardContent } from '#/components/ui/card'
import { Building2, Save, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/profile/employer')({
  component: EmployerProfilePage,
})

const employerProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  companyLogo: z.string(),
  industry: z.string().max(100),
  website: z.string(),
  description: z.string().max(2000),
  location: z.string().max(200),
  phone: z.string().max(20),
})

function EmployerProfilePage() {
  const { isPending: authPending } = useAuthGuard('employer')
  const queryClient = useQueryClient()
  const [success, setSuccess] = useState('')
  const [serverError, setServerError] = useState('')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', 'employer'],
    queryFn: async () => {
      try {
        const res = await api.get<ApiResponse<EmployerProfile>>(
          '/api/v1/profile/employer'
        )
        return res.data.data
      } catch {
        return null
      }
    },
  })

  const form = useForm({
    defaultValues: {
      companyName: '',
      companyLogo: '',
      industry: '',
      website: '',
      description: '',
      location: '',
      phone: '',
    },
    validators: {
      onSubmit: employerProfileSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError('')
      setSuccess('')
      try {
        const body = {
          companyName: value.companyName,
          companyLogo: value.companyLogo || undefined,
          industry: value.industry || undefined,
          website: value.website || undefined,
          description: value.description || undefined,
          location: value.location || undefined,
          phone: value.phone || undefined,
        }

        if (profile) {
          await api.put('/api/v1/profile/employer', body)
        } else {
          await api.post('/api/v1/profile/employer', body)
        }

        setSuccess('Profile saved successfully!')
        queryClient.invalidateQueries({ queryKey: ['profile', 'employer'] })
        setTimeout(() => setSuccess(''), 3000)
      } catch (err: any) {
        setServerError(err.message || 'Failed to save profile')
      }
    },
  })

  useEffect(() => {
    if (profile) {
      form.setFieldValue('companyName', profile.companyName || '')
      form.setFieldValue('companyLogo', profile.companyLogo || '')
      form.setFieldValue('industry', profile.industry || '')
      form.setFieldValue('website', profile.website || '')
      form.setFieldValue('description', profile.description || '')
      form.setFieldValue('location', profile.location || '')
      form.setFieldValue('phone', profile.phone || '')
    }
  }, [profile])

  if (authPending || isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-zinc-800 rounded" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-zinc-800 rounded" />
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
          <Building2 size={20} className="text-zinc-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Employer Profile</h1>
          <p className="text-sm text-zinc-400">
            {profile ? 'Update company details' : 'Set up your company profile'}
          </p>
        </div>
      </div>

      <Card className="border-zinc-800/60 bg-zinc-900/60">
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

            <form.Field name="companyName">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-zinc-300">
                    Company Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    placeholder="TechCorp India"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    maxLength={200}
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-400">{field.state.meta.errors.join(', ')}</p>
                  )}
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <form.Field name="industry">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Industry</Label>
                    <Input
                      placeholder="Technology"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      maxLength={100}
                      className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="location">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Location</Label>
                    <Input
                      placeholder="Bangalore, India"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      maxLength={200}
                      className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <form.Field name="website">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Website</Label>
                    <Input
                      placeholder="https://techcorp.in"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-red-400">{field.state.meta.errors.join(', ')}</p>
                    )}
                  </div>
                )}
              </form.Field>
              <form.Field name="phone">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Phone</Label>
                    <Input
                      placeholder="+91-9876543210"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      maxLength={20}
                      className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="companyLogo">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-zinc-300">Company Logo URL</Label>
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
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
                  <Label className="text-zinc-300">Description</Label>
                  <Textarea
                    placeholder="Tell job seekers about your company..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 resize-none"
                  />
                </div>
              )}
            </form.Field>

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
