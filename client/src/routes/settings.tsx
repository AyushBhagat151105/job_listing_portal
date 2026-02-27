import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
    Settings as SettingsIcon,
    Loader2,
    Save,
    ShieldAlert,
    Monitor,
    CheckCircle2,
    Trash2,
    KeyRound,
    UserCircle,
    Shield,
    Smartphone,
    AlertTriangle
} from 'lucide-react'
import { useState } from 'react'
import { authClient } from '../lib/auth-client'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { SeekerProfileForm } from '../components/profile/SeekerProfileForm'
import { EmployerProfileForm } from '../components/profile/EmployerProfileForm'

export const Route = createFileRoute('/settings')({
    component: SettingsPage,
})

function SettingsPage() {
    const { user, isPending } = useAuthGuard(undefined, { requireProfile: true })
    const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'security' | 'sessions'>('profile')

    if (isPending || !user) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-48 bg-muted rounded" />
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-64 h-64 bg-muted rounded-xl" />
                        <div className="flex-1 h-96 bg-muted rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    const navigation = [
        { id: 'profile', label: 'Profile Settings', icon: UserCircle, description: 'Manage your public persona' },
        { id: 'account', label: 'Account Preferences', icon: SettingsIcon, description: 'Update email, name' },
        { id: 'security', label: 'Security', icon: Shield, description: 'Password and authentication' },
        { id: 'sessions', label: 'Active Sessions', icon: Smartphone, description: 'Manage login devices' },
    ] as const

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <SettingsIcon size={24} className="text-zinc-900" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                        Settings
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your profile, security, and account preferences
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${isActive
                                    ? 'bg-muted text-foreground shadow-sm ring-1 ring-border shadow-black/5'
                                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                                    } cursor-pointer`}
                            >
                                <Icon size={20} className={isActive ? 'text-teal-500' : ''} />
                                <div>
                                    <div className="font-medium text-sm">{item.label}</div>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === 'profile' && (
                            (user as typeof user & { role?: string }).role === 'employer' ? <EmployerProfileForm /> : <SeekerProfileForm />
                        )}
                        {activeTab === 'account' && <AccountSettingsTab user={user} />}
                        {activeTab === 'security' && <SecuritySettingsTab />}
                        {activeTab === 'sessions' && <SessionsTab />}
                    </div>
                </div>
            </div>
        </div>
    )
}

function AccountSettingsTab({ user }: { user: { name: string, role?: string } | (typeof authClient.$Infer.Session)['user'] }) {
    const [success, setSuccess] = useState('')
    const [serverError, setServerError] = useState('')

    const nameForm = useForm({
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

    const [deleteConfirm, setDeleteConfirm] = useState('')
    const [deletePassword, setDeletePassword] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState('')

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'DELETE') return
        setIsDeleting(true)
        setDeleteError('')
        try {
            const { error } = await authClient.deleteUser({
                password: deletePassword,
                callbackURL: '/'
            })
            if (error) {
                setDeleteError(error.message || 'Failed to delete account. Did you enter the correct password?')
                setIsDeleting(false)
            } else {
                window.location.href = '/'
            }
        } catch {
            setDeleteError('An unexpected error occurred')
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
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
                            nameForm.handleSubmit()
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

                        <nameForm.Field name="name">
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
                        </nameForm.Field>

                        <nameForm.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
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
                        </nameForm.Subscribe>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-destructive/30 bg-destructive/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-destructive/50" />
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive mb-0.5" size={20} />
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    </div>
                    <CardDescription className="text-muted-foreground">
                        Permanently delete your account and remove all associated data. This action is irreversible.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-md">
                    {deleteError && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                            <ShieldAlert size={16} /> {deleteError}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label className="text-foreground font-semibold">Confirm by typing "DELETE"</Label>
                        <Input
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            className="bg-background border-input font-mono placeholder:font-sans"
                            placeholder="Type DELETE"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-foreground font-semibold">Confirm Password <span className="text-red-400">*</span></Label>
                        <Input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="bg-background border-input"
                            placeholder="Enter your password..."
                        />
                        <p className="text-xs text-muted-foreground mt-1">Required to verify your identity.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        variant="destructive"
                        disabled={deleteConfirm !== 'DELETE' || !deletePassword || isDeleting}
                        onClick={handleDeleteAccount}
                        className="w-full sm:w-auto font-medium cursor-pointer bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20"
                    >
                        {isDeleting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
                        Yes, Delete My Account
                    </Button>
                </CardFooter>
            </Card>
        </div>
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
                    className="space-y-5 max-w-md"
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
        : ((sessionsEntry as unknown as { sessions?: typeof authClient.$Infer.Session.session[] })?.sessions || sessionsEntry || []) as typeof authClient.$Infer.Session.session[]

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
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                        <ShieldAlert size={16} /> No active sessions found.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-muted-foreground border border-border shrink-0">
                                        <Monitor size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-medium text-foreground truncate">{session.userAgent?.split(' ')[0] || 'Unknown Device'}</h4>
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                            IP: {session.ipAddress || 'Unknown'} • Logged in: {new Date(session.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRevoke(session.token)}
                                    className="border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground font-medium cursor-pointer ml-4 shrink-0"
                                >
                                    <Trash2 size={14} className="mr-2 hidden sm:block" />
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
