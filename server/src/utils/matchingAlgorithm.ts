export interface JobInput {
    title: string;
    description: string;
    qualifications?: string | null;
    responsibilities?: string | null;
    location: string;
}

export interface ProfileInput {
    location?: string | null;
    headline?: string | null;
    skills?: string[] | null;
}

export function calculateMatchScore(job: JobInput, profile?: ProfileInput | null): { matchScore: number; matchDetails: string[] } {
    let matchScore = 0;
    const matchDetails: string[] = [];

    if (!profile) return { matchScore, matchDetails };

    // Combine job text for checking keyword matches
    const jobText = `${job.title} ${job.description} ${job.qualifications || ''} ${job.responsibilities || ''}`.toLowerCase();
    const jobLocation = job.location.toLowerCase();

    // Simple tokenizer for job title keywords
    const titleKeywords = job.title.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);

    // 1. Location Match (+20 pts)
    if (profile.location && profile.location.toLowerCase().includes(jobLocation)) {
        matchScore += 20;
        matchDetails.push("Location matches exactly");
    } else if (profile.location) {
        matchDetails.push("Location differs");
    }

    // 2. Headline Match (+10 pts)
    if (profile.headline) {
        const headlineLower = profile.headline.toLowerCase();
        const matchedKeywords = titleKeywords.filter(kw => headlineLower.includes(kw));

        if (matchedKeywords.length > 0) {
            matchScore += 10;
            matchDetails.push(`Headline matches role (${matchedKeywords.join(", ")})`);
        }
    }

    // 3. Skills Match (+10 pts per skill found in the job text)
    if (profile.skills && profile.skills.length > 0) {
        const matchedSkills = profile.skills.filter(s => jobText.includes(s.toLowerCase()));
        if (matchedSkills.length > 0) {
            const skillPoints = matchedSkills.length * 10;
            matchScore += skillPoints;
            matchDetails.push(`Matches ${matchedSkills.length} skills (+${skillPoints} pts)`);
        }
    }

    return { matchScore, matchDetails };
}
