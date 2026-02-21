import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { jwt, openAPI, admin } from "better-auth/plugins";
import { ac, jobSeeker, employer, admin as adminRole } from "./permissions";

const ALLOWED_SIGNUP_ROLES = ["job_seeker", "employer"] as const;

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    emailAndPassword: {
        enabled: true
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "job_seeker",
                input: true,
            },
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const role = (user.role as string) || "job_seeker";
                    if (!ALLOWED_SIGNUP_ROLES.includes(role as any)) {
                        return {
                            data: { ...user, role: "job_seeker" },
                        };
                    }
                    return { data: { ...user, role } };
                },
            },
        },
    },
    plugins: [
        jwt(),
        openAPI(),
        admin({
            defaultRole: "job_seeker",
            ac,
            roles: {
                job_seeker: jobSeeker,
                employer: employer,
                admin: adminRole,
            },
        }),
    ]
})