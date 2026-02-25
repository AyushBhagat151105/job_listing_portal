import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState } from 'react'
import { authClient } from '../lib/auth-client'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '#/components/ui/card'
import { Mail, Lock, User, UserPlus, Loader2, Briefcase, Search } from 'lucide-react'

export const Route = createFileRoute('/sign-up')({
    component: SignUpPage,
})

const signUpSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['job_seeker', 'employer']),
})

function SignUpPage() {
    const navigate = useNavigate()
    const [serverError, setServerError] = useState('')

    const form = useForm({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            role: 'job_seeker' as 'job_seeker' | 'employer',
        },
        validators: {
            onSubmit: signUpSchema,
        },
        onSubmit: async ({ value }) => {
            setServerError('')
            try {
                const result = await authClient.signUp.email({
                    name: value.name,
                    email: value.email,
                    password: value.password,
                    role: value.role,
                } as any)

                if (result.error) {
                    setServerError(result.error.message || 'Sign up failed')
                } else {
                    navigate({ to: '/' })
                }
            } catch {
                setServerError('An unexpected error occurred')
            }
        },
    })

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />

            <Card className="w-full max-w-md border-zinc-800/60 bg-zinc-900/80 backdrop-blur-xl shadow-2xl relative z-10">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex items-center gap-2 text-teal-400 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                            <UserPlus size={16} className="text-zinc-900" />
                        </div>
                        <span className="text-sm font-semibold tracking-wider uppercase">
                            JobPortal
                        </span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-zinc-100">
                        Create your account
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Join JobPortal and start your journey
                    </CardDescription>
                </CardHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                >
                    <CardContent className="space-y-4">
                        {serverError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {serverError}
                            </div>
                        )}

                        {/* Role Selection */}
                        <form.Field name="role">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">I am a</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => field.handleChange('job_seeker')}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${field.state.value === 'job_seeker'
                                                ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                                                : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                                                }`}
                                        >
                                            <Search size={24} />
                                            <span className="text-sm font-medium">Job Seeker</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => field.handleChange('employer')}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${field.state.value === 'employer'
                                                ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                                                : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                                                }`}
                                        >
                                            <Briefcase size={24} />
                                            <span className="text-sm font-medium">Employer</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="name">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name} className="text-zinc-300">
                                        Full Name
                                    </Label>
                                    <div className="relative">
                                        <User
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                                        />
                                        <Input
                                            id={field.name}
                                            type="text"
                                            placeholder="John Doe"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className="pl-10 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-teal-500 focus:ring-teal-500/20"
                                        />
                                    </div>
                                    {field.state.meta.errors.length > 0 && (
                                        <p className="text-xs text-red-400">
                                            {field.state.meta.errors.join(', ')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="email">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name} className="text-zinc-300">
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Mail
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                                        />
                                        <Input
                                            id={field.name}
                                            type="email"
                                            placeholder="you@example.com"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className="pl-10 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-teal-500 focus:ring-teal-500/20"
                                        />
                                    </div>
                                    {field.state.meta.errors.length > 0 && (
                                        <p className="text-xs text-red-400">
                                            {field.state.meta.errors.join(', ')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="password">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name} className="text-zinc-300">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                                        />
                                        <Input
                                            id={field.name}
                                            type="password"
                                            placeholder="••••••••"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className="pl-10 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-teal-500 focus:ring-teal-500/20"
                                        />
                                    </div>
                                    {field.state.meta.errors.length > 0 && (
                                        <p className="text-xs text-red-400">
                                            {field.state.meta.errors.join(', ')}
                                        </p>
                                    )}
                                    <p className="text-xs text-zinc-500">
                                        Must be at least 8 characters
                                    </p>
                                </div>
                            )}
                        </form.Field>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 pt-2">
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
                                        <Loader2 size={18} className="animate-spin mr-2" />
                                    ) : (
                                        <UserPlus size={18} className="mr-2" />
                                    )}
                                    Create Account
                                </Button>
                            )}
                        </form.Subscribe>

                        <p className="text-sm text-zinc-400 text-center">
                            Already have an account?{' '}
                            <Link
                                to="/sign-in"
                                className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
