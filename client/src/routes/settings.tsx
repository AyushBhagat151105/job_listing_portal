import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Settings as SettingsIcon, Loader2, Save, ShieldAlert, Monitor, CheckCircle2, Trash2, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { authClient } from '../lib/auth-client'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

export const Route = createFileRoute('/settings')({
    component: SettingsPage,
})

function SettingsPage() {
    const { user, isPending } = useAuthGuard(undefined, { requireProfile: true })

    if (isPending) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-48 bg-muted rounded" />
                    <div className="h-64 bg-muted rounded-xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <SettingsIcon size={20} className="text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Account Settings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your profile, security, and sessions
                    </p>
                </div>
            </div>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 bg-muted/50 border border-border p-1 rounded-xl mb-8 h-auto">
                    <TabsTrigger value="account" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2">Account</TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2">Security</TabsTrigger>
                    <TabsTrigger value="sessions" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2">Sessions</TabsTrigger>
                </TabsList>

                <TabsContent value="account">
                    <AccountSettingsTab user={user} />
                </TabsContent>

                <TabsContent value="security">
                    <SecuritySettingsTab />
                </TabsContent>

                <TabsContent value="sessions">
                    <SessionsTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function AccountSettingsTab({ user }: { user: any }) {
    const [success, setSuccess] = useState('')
    const [serverError, setServerError] = useState('')

    const form = useForm({
        defaultValues: { name: user?.name || '' },
        validators: {
            onSubmit: z.object({
                name: z.string().min(1, 'Name is required'),
            }),
        },
        onSubmit: async ({ value }) => {
            setSuccess('')
            setServerError('')
            try {
                const { error } = await authClient.updateUser({
                    name: value.name,
                })
                if (error) {
                    setServerError(error.message || 'Failed to update account')
                } else {
                    setSuccess('Account updated successfully')
                    setTimeout(() => setSuccess(''), 3000)
                }
            } catch {
                setServerError('An unexpected error occurred')
            }
        },
    })

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-foreground">Account Information</CardTitle>
                <CardDescription className="text-muted-foreground">Update your basic account details.</CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="space-y-4 max-w-md"
                >
                    {success && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                            <CheckCircle2 size={16} /> {success}
                        </div>
                    )}
                    {serverError && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                            <ShieldAlert size={16} /> {serverError}
                        </div>
                    )}

                    <form.Field name="name">
                        {(field) => (
                            <div className="space-y-2">
                                <Label className="text-foreground">Full Name</Label>
                                <Input
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-teal-500 focus:ring-teal-500/20"
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <p className="text-xs text-red-400">{field.state.meta.errors.join(', ')}</p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
                        {([isSubmitting, canSubmit]) => (
                            <Button
                                type="submit"
                                disabled={!canSubmit || isSubmitting}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer"
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                                Save Changes
                            </Button>
                        )}
                    </form.Subscribe>
                </form>
            </CardContent>
        </Card>
    )
}

function SecuritySettingsTab() {
    const [success, setSuccess] = useState('')
    const [serverError, setServerError] = useState('')

    const form = useForm({
        defaultValues: { currentPassword: '', newPassword: '' },
        validators: {
            onSubmit: z.object({
                currentPassword: z.string().min(1, 'Current password is required'),
                newPassword: z.string().min(8, 'New password must be at least 8 characters'),
            }),
        },
        onSubmit: async ({ value }) => {
            setSuccess('')
            setServerError('')
            try {
                const { error } = await authClient.changePassword({
                    currentPassword: value.currentPassword,
                    newPassword: value.newPassword,
                    revokeOtherSessions: true,
                })
                if (error) {
                    setServerError(error.message || 'Failed to change password')
                } else {
                    setSuccess('Password changed successfully')
                    form.reset()
                    setTimeout(() => setSuccess(''), 3000)
                }
            } catch {
                setServerError('An unexpected error occurred')
            }
        },
    })

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-foreground">Change Password</CardTitle>
                <CardDescription className="text-muted-foreground">Ensure your account is using a long, random password to stay secure.</CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="space-y-4 max-w-md"
                >
                    {success && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                            <CheckCircle2 size={16} /> {success}
                        </div>
                    )}
                    {serverError && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                            <ShieldAlert size={16} /> {serverError}
                        </div>
                    )}

                    <form.Field name="currentPassword">
                        {(field) => (
                            <div className="space-y-2">
                                <Label className="text-foreground">Current Password</Label>
                                <Input
                                    type="password"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-teal-500 focus:ring-teal-500/20"
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <p className="text-xs text-red-400">{field.state.meta.errors.join(', ')}</p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="newPassword">
                        {(field) => (
                            <div className="space-y-2">
                                <Label className="text-foreground">New Password</Label>
                                <Input
                                    type="password"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-teal-500 focus:ring-teal-500/20"
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <p className="text-xs text-red-400">{field.state.meta.errors.join(', ')}</p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
                        {([isSubmitting, canSubmit]) => (
                            <Button
                                type="submit"
                                disabled={!canSubmit || isSubmitting}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer"
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <KeyRound size={16} className="mr-2" />}
                                Update Password
                            </Button>
                        )}
                    </form.Subscribe>
                </form>
            </CardContent>
        </Card>
    )
}

function SessionsTab() {
    const queryClient = useQueryClient()
    const { data: sessionsEntry, isPending } = useQuery({
        queryKey: ['sessions'],
        queryFn: async () => {
            const res = await authClient.listSessions()
            if (res.error) throw res.error
            return res.data
        }
    })

    const sessions = Array.isArray(sessionsEntry)
        ? sessionsEntry
        : (sessionsEntry as any)?.sessions || (sessionsEntry as any) || []

    const handleRevoke = async (token: string) => {
        await authClient.revokeSession({ token })
        queryClient.invalidateQueries({ queryKey: ['sessions'] })
    }

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-foreground">Active Sessions</CardTitle>
                <CardDescription className="text-muted-foreground">View and manage devices logged into your account.</CardDescription>
            </CardHeader>
            <CardContent>
                {isPending ? (
                    <div className="flex items-center justify-center p-8 text-muted-foreground"><Loader2 className="animate-spin" /></div>
                ) : sessions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No active sessions found.</p>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session: any) => (
                            <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                        <Monitor size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-foreground">{session.userAgent?.split(' ')[0] || 'Unknown Device'}</h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            IP: {session.ipAddress || 'Unknown'} • Logged in: {new Date(session.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRevoke(session.token)}
                                    className="border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground font-medium cursor-pointer"
                                >
                                    <Trash2 size={14} className="mr-2" />
                                    Revoke
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
