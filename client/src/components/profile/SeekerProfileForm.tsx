import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import type { ApiResponse, JobSeekerProfile } from '../../lib/api'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { User, Save, Loader2, Plus, X } from 'lucide-react'

const seekerProfileSchema = z.object({
    headline: z.string().max(200),
    summary: z.string().max(2000),
    phone: z.string().max(20),
    location: z.string().max(200),
    resumeUrl: z.string(),
})

export function SeekerProfileForm() {
    const queryClient = useQueryClient()
    const [skills, setSkills] = useState<string[]>([])
    const [newSkill, setNewSkill] = useState('')

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', 'job_seeker'],
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

                toast.success('Profile saved successfully!')
                queryClient.invalidateQueries({ queryKey: ['profile', 'job_seeker'] })
            } catch (err: any) {
                toast.error(err.message || 'Failed to save profile')
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
                        <User size={20} className="text-zinc-900" />
                    </div>
                    <div>
                        <CardTitle className="text-foreground">Job Seeker Profile</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {profile ? 'Update your profile to stand out to employers.' : 'Create your profile to start applying to jobs.'}
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
                                className="bg-background border-input text-foreground placeholder:text-muted-foreground"
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
