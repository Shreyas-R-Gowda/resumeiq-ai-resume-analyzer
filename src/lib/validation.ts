import { z } from "zod";

const stringList = z.array(z.string()).default([]);
const boundedScore = z.coerce.number().min(0).max(100).catch(0);

const scoreBreakdownSchema = z.object({
  formattingAtsStructure: boundedScore.default(0),
  technicalSkillsRelevance: boundedScore.default(0),
  projectQuality: boundedScore.default(0),
  experienceImpactMetrics: boundedScore.default(0),
  keywordCoverage: boundedScore.default(0),
  grammarClarity: boundedScore.default(0),
});

const atsBreakdownSchema = z.object({
  readability: boundedScore.default(0),
  keywordMatching: boundedScore.default(0),
  sectionStructure: boundedScore.default(0),
  contactInfoDetection: boundedScore.default(0),
  parsingFriendliness: boundedScore.default(0),
});

const recruiterInsightsSchema = z.object({
  profileType: z
    .enum(["student", "fresher", "experienced", "career-switcher"])
    .optional(),
  strongestSection: z.string().default("Experience"),
  weakestSection: z.string().default("Summary"),
  estimatedRecruiterImpression: z.string().default("Promising resume with room to sharpen positioning."),
  interviewReadiness: z.string().default("Moderate"),
  interviewProbabilityEstimate: z.string().optional(),
  atsPassLikelihood: z.string().optional(),
  strongestRecruiterSignal: z.string().optional(),
  hiringRiskFactors: stringList.optional(),
});

export const analysisSchema = z.object({
  resumeScore: boundedScore,
  atsScore: boundedScore,
  jdMatchPercentage: boundedScore.optional(),
  strengths: stringList,
  weaknesses: stringList,
  missingKeywords: stringList,
  skills: z
    .array(
      z.union([
        z.string().transform((name) => ({ name })),
        z.object({
          name: z.string(),
          level: z
            .enum(["beginner", "intermediate", "advanced", "expert"])
            .optional(),
          evidence: z.string().optional(),
        }),
      ]),
    )
    .default([]),
  grammarIssues: stringList,
  suggestions: z
    .object({
      critical: stringList,
      important: stringList,
      optional: stringList,
    })
    .default({ critical: [], important: [], optional: [] }),
  rewrittenBullets: stringList,
  sectionFeedback: z
    .record(
      z.string(),
      z.union([
        z.string().transform((feedback) => ({ feedback })),
        z.object({
          score: z.coerce.number().min(0).max(100).optional(),
          status: z.enum(["strong", "needs-work", "missing"]).optional(),
          feedback: z.string(),
        }),
      ]),
    )
    .default({}),
  scoreBreakdown: scoreBreakdownSchema.optional(),
  atsBreakdown: atsBreakdownSchema.optional(),
  recruiterInsights: recruiterInsightsSchema.optional(),
});

export const uploadSchema = z.object({
  jobDescription: z.string().max(12000).optional(),
  useDemo: z.union([z.literal("true"), z.literal("false")]).optional(),
});

export const supportedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
