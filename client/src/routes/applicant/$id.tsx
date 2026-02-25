import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { ApiResponse } from '../../lib/api'
import { useAuthGuard } from '../../hooks/useAuthGuard'

import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Skeleton } from '#/components/ui/skeleton'
import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { ArrowLeft, MapPin, Mail, Phone, FileText, Code2, User } from 'lucide-react'

// Profile type based on backend schema
interface ApplicantProfile {
    id: string
    userId: string
    headline: string | null
    summary: string | null
    phone: string | null
    location: string | null
    resumeUrl: string | null
    skills: string[]
    createdAt: string
    user: {
        name: string
        email: string
        image: string | null
    }
}

export const Route = createFileRoute('/applicant/$id')({
    component: ApplicantProfilePage,
})

function ApplicantProfilePage() {
    const { isPending: authPending } = useAuthGuard('employer', { requireProfile: true })
    const { id } = Route.useParams()

    const { data: profile, isLoading } = useQuery({
        queryKey: ['applicant', id],
        queryFn: async () => {
            const res = await api.get<ApiResponse<ApplicantProfile>>(
                `/api/v1/profile/applicant/${id}`
            )
            return res.data.data
        },
    })

    // Use the history API to go back, so we return to whichever job's applicants page we came from
    const handleBack = () => {
        window.history.back()
    }

    if (authPending || isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Skeleton className="h-4 w-32 bg-muted mb-8" />
                <Card className="border-border bg-card p-8 shadow-xl">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <Skeleton className="w-24 h-24 rounded-2xl bg-muted shrink-0" />
                        <div className="space-y-4 flex-1 w-full">
                            <Skeleton className="h-8 w-64 bg-muted" />
                            <Skeleton className="h-4 w-48 bg-muted" />
                            <Skeleton className="h-4 w-full bg-muted" />
                            <Skeleton className="h-4 w-3/4 bg-muted" />
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center mt-20">
                <h2 className="text-xl font-bold text-foreground">Applicant Not Found</h2>
                <p className="text-muted-foreground mt-2 mb-6">The applicant profile you are looking for does not exist or has been removed.</p>
                <Button variant="outline" onClick={handleBack} className="border-input text-foreground">
                    <ArrowLeft size={16} className="mr-2" />
                    Go Back
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-teal-400 transition-colors cursor-pointer"
            >
                <ArrowLeft size={16} />
                Back to Applicants
            </button>

            <Card className="border-border bg-card shadow-xl overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-teal-900/40 to-cyan-900/40 absolute top-0 left-0 right-0" />

                <CardContent className="p-8 pt-16 relative">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <Avatar className="w-24 h-24 border-4 border-background rounded-2xl shadow-xl shrink-0">
                            <AvatarImage src={profile.user.image || undefined} alt={profile.user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-primary-foreground text-2xl font-bold rounded-2xl">
                                {profile.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 mt-4 md:mt-0">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                                        {profile.user.name}
                                    </h1>
                                    {profile.headline ? (
                                        <p className="text-lg text-teal-400 mt-1 font-medium">{profile.headline}</p>
                                    ) : (
                                        <p className="text-lg text-muted-foreground mt-1 italic">No headline provided</p>
                                    )}
                                </div>

                                {profile.resumeUrl && (
                                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shrink-0">
                                        <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                                            <FileText size={16} className="mr-2" />
                                            View Resume
                                        </a>
                                    </Button>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 mt-6">
                                <div className="flex items-center text-muted-foreground text-sm">
                                    <Mail size={16} className="mr-2 text-muted-foreground" />
                                    <a href={`mailto:${profile.user.email}`} className="hover:text-teal-400 transition-colors">
                                        {profile.user.email}
                                    </a>
                                </div>

                                {profile.phone && (
                                    <div className="flex items-center text-muted-foreground text-sm">
                                        <Phone size={16} className="mr-2 text-muted-foreground" />
                                        <a href={`tel:${profile.phone}`} className="hover:text-teal-400 transition-colors">
                                            {profile.phone}
                                        </a>
                                    </div>
                                )}

                                {profile.location && (
                                    <div className="flex items-center text-muted-foreground text-sm">
                                        <MapPin size={16} className="mr-2 text-muted-foreground" />
                                        {profile.location}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-border bg-card">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                    <User size={16} className="text-teal-400" />
                                </div>
                                Professional Summary
                            </h2>
                            {profile.summary ? (
                                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
                                    {profile.summary}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic text-sm">No summary provided</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-border bg-card">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                    <Code2 size={16} className="text-teal-400" />
                                </div>
                                Top Skills
                            </h2>

                            {profile.skills && profile.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill) => (
                                        <Badge
                                            key={skill}
                                            variant="secondary"
                                            className="bg-muted text-foreground hover:bg-muted/80 transition-colors font-medium border border-border"
                                        >
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic text-sm">No skills listed</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

