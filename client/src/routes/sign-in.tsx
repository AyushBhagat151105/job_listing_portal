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
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/sign-in')({
    component: SignInPage,
})

const signInSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
})

function SignInPage() {
    const navigate = useNavigate()
    const [serverError, setServerError] = useState('')

    const form = useForm({
        defaultValues: { email: '', password: '' },
        validators: {
            onSubmit: signInSchema,
        },
        onSubmit: async ({ value }) => {
            setServerError('')
            try {
                const result = await authClient.signIn.email({
                    email: value.email,
                    password: value.password,
                })
                if (result.error) {
                    setServerError(result.error.message || 'Sign in failed')
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
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />

            <Card className="w-full max-w-md border-zinc-800/60 bg-zinc-900/80 backdrop-blur-xl shadow-2xl relative z-10">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex items-center gap-2 text-teal-400 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                            <LogIn size={16} className="text-zinc-900" />
                        </div>
                        <span className="text-sm font-semibold tracking-wider uppercase">
                            JobPortal
                        </span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-zinc-100">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Sign in to your account to continue
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
                                </div>
                            )}
                        </form.Field>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 pt-2">
                        <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
                            {([isSubmitting, canSubmit]) => (
                                <Button
                                    type="submit"
                                    disabled={!canSubmit || isSubmitting}
                                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-zinc-900 font-semibold shadow-lg shadow-teal-500/20 cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={18} className="animate-spin mr-2" />
                                    ) : (
                                        <LogIn size={18} className="mr-2" />
                                    )}
                                    Sign In
                                </Button>
                            )}
                        </form.Subscribe>

                        <p className="text-sm text-zinc-400 text-center">
                            Don&apos;t have an account?{' '}
                            <Link
                                to="/sign-up"
                                className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
                            >
                                Create one
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
