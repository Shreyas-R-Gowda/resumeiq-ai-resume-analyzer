export type SuggestionGroup = {
  critical: string[];
  important: string[];
  optional: string[];
};

export type SectionFeedback = Record<
  string,
  {
    score?: number;
    status?: "strong" | "needs-work" | "missing";
    feedback: string;
  }
>;

export type SkillItem = {
  name: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  evidence?: string;
};

export type ScoreBreakdown = {
  formattingAtsStructure: number;
  technicalSkillsRelevance: number;
  projectQuality: number;
  experienceImpactMetrics: number;
  keywordCoverage: number;
  grammarClarity: number;
};

export type AtsBreakdown = {
  readability: number;
  keywordMatching: number;
  sectionStructure: number;
  contactInfoDetection: number;
  parsingFriendliness: number;
};

export type RecruiterInsights = {
  profileType?: "student" | "fresher" | "experienced" | "career-switcher";
  strongestSection: string;
  weakestSection: string;
  estimatedRecruiterImpression: string;
  interviewReadiness: string;
  interviewProbabilityEstimate?: string;
  atsPassLikelihood?: string;
  strongestRecruiterSignal?: string;
  hiringRiskFactors?: string[];
};

export type AnalysisResult = {
  resumeScore: number;
  atsScore: number;
  jdMatchPercentage?: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  skills: SkillItem[];
  grammarIssues: string[];
  suggestions: SuggestionGroup;
  rewrittenBullets: string[];
  sectionFeedback: SectionFeedback;
  scoreBreakdown?: ScoreBreakdown;
  atsBreakdown?: AtsBreakdown;
  recruiterInsights?: RecruiterInsights;
};

export type AnalyzeResponse = {
  analysis: AnalysisResult;
  resumeText: string;
  fileName: string;
};

export type AnalyzeErrorResponse = {
  success: false;
  error: string;
};
