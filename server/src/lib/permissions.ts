import { createAccessControl } from "better-auth/plugins/access";

/**
 * Define all resources and their possible actions.
 * Use `as const` so TypeScript can infer the types correctly.
 */
const statement = {
    job: ["create", "update", "delete", "view"],
    application: ["create", "view", "manage"],
    profile: ["create", "update", "view"],
    dashboard: ["view"],
} as const;

export const ac = createAccessControl(statement);

/**
 * Job Seeker — can browse jobs, apply, and manage their own profile.
 */
export const jobSeeker = ac.newRole({
    job: ["view"],
    application: ["create", "view"],
    profile: ["create", "update", "view"],
    dashboard: ["view"],
});

/**
 * Employer — can create/manage job listings and review applications.
 */
export const employer = ac.newRole({
    job: ["create", "update", "delete", "view"],
    application: ["view", "manage"],
    profile: ["create", "update", "view"],
    dashboard: ["view"],
});

/**
 * Admin — full access to everything.
 */
export const admin = ac.newRole({
    job: ["create", "update", "delete", "view"],
    application: ["create", "view", "manage"],
    profile: ["create", "update", "view"],
    dashboard: ["view"],
});
