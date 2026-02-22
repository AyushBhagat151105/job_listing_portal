import { describe, it, expect } from "bun:test";
import { calculateMatchScore, type JobInput, type ProfileInput } from "../matchingAlgorithm";

describe("Candidate Matching Algorithm", () => {
    const job: JobInput = {
        title: "Senior Full Stack Developer",
        description: "We are looking for a dev with React and Node.js experience.",
        qualifications: "TypeScript knowledge is a plus.",
        location: "Mumbai",
    };

    it("should return 0 score and empty details for missing profile", () => {
        const result = calculateMatchScore(job, null);

        expect(result.matchScore).toBe(0);
        expect(result.matchDetails).toHaveLength(0);
    });

    it("should score location match (+20 pts)", () => {
        const profile: ProfileInput = {
            location: "Navi Mumbai",
        };
        const result = calculateMatchScore(job, profile);

        expect(result.matchScore).toBe(20);
        expect(result.matchDetails).toContain("Location matches exactly");
    });

    it("should score headline match based on job title (+10 pts)", () => {
        const profile: ProfileInput = {
            headline: "Experienced Full Stack Developer",
            location: "Delhi",
        };
        const result = calculateMatchScore(job, profile);

        expect(result.matchScore).toBe(10);
        expect(result.matchDetails[1]).toMatch(/Headline matches role/);
    });

    it("should score skills correctly based on job text (+10 per skill)", () => {
        const profile: ProfileInput = {
            skills: ["React", "TypeScript", "Python"],
            location: "Delhi",
        };
        const result = calculateMatchScore(job, profile);

        expect(result.matchScore).toBe(20);
        expect(result.matchDetails[1]).toMatch(/Matches 2 skills/);
    });

    it("should cap points correctly for a perfect candidate", () => {
        const profile: ProfileInput = {
            location: "mumbai",
            headline: "Senior Full Stack Dev",
            skills: ["React", "Node.js", "TypeScript"],
        };
        const result = calculateMatchScore(job, profile);
        expect(result.matchScore).toBe(60);
        expect(result.matchDetails).toHaveLength(3);
    });
});
