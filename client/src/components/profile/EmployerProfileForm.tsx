import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useEffect } from 'react'
import { api } from '../../lib/api'
import type { ApiResponse, EmployerProfile } from '../../lib/api'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#/components/ui/card'
import { Building2, Save, Loader2 } from 'lucide-react'

const employerProfileSchema = z.object({
    companyName: z.string().min(1, 'Company name is required').max(200),
    companyLogo: z.string(),
    industry: z.string().max(100),
    website: z.string(),
    description: z.string().max(2000),
    location: z.string().max(200),
    phone: z.string().max(20),
})

export function EmployerProfileForm() {
    const queryClient = useQueryClient()

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

                toast.success('Profile saved successfully!')
                queryClient.invalidateQueries({ queryKey: ['profile', 'employer'] })
            } catch (err: any) {
                toast.error(err.message || 'Failed to save profile')
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

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-48 bg-muted rounded" />
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-10 bg-muted rounded" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                        <Building2 size={20} className="text-zinc-900" />
                    </div>
                    <div>
                        <CardTitle className="text-foreground">Employer Profile</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {profile ? 'Update company details.' : 'Set up your company profile.'}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="space-y-5"
                >

                    <form.Field name="companyName">
                        {(field) => (
                            <div className="space-y-2">
                                <Label className="text-foreground">
                                    Company Name <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    placeholder="TechCorp India"
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <form.Field name="industry">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label className="text-foreground">Industry</Label>
                                    <Input
                                        placeholder="Technology"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        maxLength={100}
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
                                        placeholder="Bangalore, India"
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <form.Field name="website">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label className="text-foreground">Website</Label>
                                    <Input
                                        placeholder="https://techcorp.in"
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
                    </div>

                    <form.Field name="companyLogo">
                        {(field) => (
                            <div className="space-y-2">
                                <Label className="text-foreground">Company Logo URL</Label>
                                <Input
                                    placeholder="https://example.com/logo.png"
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

                    <form.Field name="description">
                        {(field) => (
                            <div className="space-y-2">
                                <Label className="text-foreground">Description</Label>
                                <Textarea
                                    placeholder="Tell job seekers about your company..."
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

                    <form.Subscribe
                        selector={(state) => [state.isSubmitting, state.canSubmit]}
                    >
                        {([isSubmitting, canSubmit]) => (
                            <Button
                                type="submit"
                                disabled={!canSubmit || isSubmitting}
                                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-zinc-900 font-semibold shadow-lg shadow-teal-500/20 cursor-pointer"
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
    )
}
