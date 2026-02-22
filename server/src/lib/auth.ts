import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { jwt, openAPI, admin } from "better-auth/plugins";
import { ac, jobSeeker, employer, admin as adminRole } from "./permissions";

const ALLOWED_SIGNUP_ROLES = ["job_seeker", "employer"] as const;

const adminPlugin = admin({
    defaultRole: "job_seeker",
    ac,
    roles: {
        job_seeker: jobSeeker,
        employer: employer,
        admin: adminRole,
    },
});
// The admin plugin restricts the 'role' field by default, meaning users can't set it during signup.
// We override the schema here, bypassing the ROLE_IS_NOT_ALLOWED_TO_BE_SET error.
if (adminPlugin.schema && adminPlugin.schema.user && adminPlugin.schema.user.fields && adminPlugin.schema.user.fields.role) {
    // @ts-expect-error - 'input' is typed strictly as 'false', but we want to allow it
    adminPlugin.schema.user.fields.role.input = true;
}

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
        adminPlugin,
    ]
})