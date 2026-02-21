import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { jwt, openAPI, admin } from "better-auth/plugins";
import { ac, jobSeeker, employer, admin as adminRole } from "./permissions";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    emailAndPassword: {
        enabled: true
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