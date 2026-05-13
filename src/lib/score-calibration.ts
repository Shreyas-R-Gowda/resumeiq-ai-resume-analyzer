import type { AnalysisResult, AtsBreakdown, ScoreBreakdown, SectionFeedback } from "@/types/resume";

type ResumeSignals = {
  profileType: "student" | "fresher" | "experienced" | "career-switcher";
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedIn: boolean;
  quantifiedBullets: number;
  projectMentions: number;
  actionVerbBullets: number;
  sectionCount: number;
  keywordCoverage: number;
  technicalSkillHits: number;
  experienceMentions: number;
};

type UnifiedScores = {
  resumeScore: number;
  atsScore: number;
  scoreBreakdown: ScoreBreakdown;
  atsBreakdown: AtsBreakdown;
};

const sectionPatterns = [/summary/i, /experience/i, /projects?/i, /skills?/i, /education/i];

const technicalKeywords = [
  "react",
  "next.js",
  "typescript",
  "javascript",
  "node",
  "python",
  "java",
  "sql",
  "aws",
  "docker",
  "kubernetes",
  "tailwind",
  "postgres",
  "mongodb",
  "redis",
  "graphql",
];

const actionVerbs = [
  "built",
  "developed",
  "designed",
  "implemented",
  "launched",
  "optimized",
  "improved",
  "delivered",
  "created",
  "engineered",
];

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function countMatches(text: string, pattern: RegExp) {
  return (text.match(pattern) || []).length;
}

function inferProfileType(resumeText: string) {
  if (/(b\.tech|btech|bachelor|student|cgpa|coursework|university|college|internship)/i.test(resumeText)) {
    return "student" as const;
  }
  if (/(career change|transition|switching|previously in)/i.test(resumeText)) {
    return "career-switcher" as const;
  }
  if (/(senior|lead|staff|manager|director|\b\d+\+ years\b)/i.test(resumeText)) {
    return "experienced" as const;
  }
  if (/fresher|entry level|recent graduate/i.test(resumeText)) {
    return "fresher" as const;
  }
  return "fresher" as const;
}

function extractSignals(resumeText: string, analysis: AnalysisResult, jobDescription?: string): ResumeSignals {
  const normalized = resumeText.toLowerCase();
  const missingKeywordCount = analysis.missingKeywords.length;
  const jdKeywordBase = jobDescription ? missingKeywordCount + 10 : 12;
  const presentKeywords = Math.max(jdKeywordBase - missingKeywordCount, 0);

  return {
    profileType: inferProfileType(resumeText),
    hasEmail: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(resumeText),
    hasPhone: /(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/.test(resumeText),
    hasLinkedIn: /linkedin\.com/i.test(resumeText),
    quantifiedBullets: countMatches(resumeText, /\b\d+%|\b\d+\+|\$\d+|\b\d+\s?(users|customers|months|weeks|days|hours|x)\b/gi),
    projectMentions: countMatches(resumeText, /\bproject(s)?\b/gi),
    actionVerbBullets: actionVerbs.reduce(
      (count, verb) => count + countMatches(normalized, new RegExp(`\\b${verb}\\b`, "g")),
      0,
    ),
    sectionCount: sectionPatterns.reduce(
      (count, pattern) => count + (pattern.test(resumeText) ? 1 : 0),
      0,
    ),
    keywordCoverage: clamp((presentKeywords / jdKeywordBase) * 100),
    technicalSkillHits: technicalKeywords.reduce(
      (count, keyword) => count + (normalized.includes(keyword) ? 1 : 0),
      0,
    ),
    experienceMentions: countMatches(resumeText, /\bexperience|internship|worked|software engineer|developer\b/gi),
  };
}

function buildScoreBreakdown(
  analysis: AnalysisResult,
  signals: ResumeSignals,
  jobDescription?: string,
): ScoreBreakdown {
  const studentBoost = signals.profileType === "student" || signals.profileType === "fresher" ? 8 : 0;

  return {
    formattingAtsStructure: clamp(
      58 + signals.sectionCount * 7 + (signals.hasEmail ? 8 : 0) + (signals.hasPhone ? 6 : 0),
    ),
    technicalSkillsRelevance: clamp(
      55 + signals.technicalSkillHits * 3 + Math.min(analysis.skills.length, 6) * 4 + studentBoost,
    ),
    projectQuality: clamp(
      56 + Math.min(signals.projectMentions, 3) * 7 + Math.min(signals.quantifiedBullets, 5) * 4 + studentBoost,
    ),
    experienceImpactMetrics: clamp(
      48 +
        Math.min(signals.quantifiedBullets, 6) * 7 +
        Math.min(signals.actionVerbBullets, 6) * 3 +
        (signals.profileType === "student" ? 8 : 0),
    ),
    keywordCoverage: clamp(
      jobDescription ? signals.keywordCoverage : 68 + Math.min(signals.technicalSkillHits, 6) * 4,
    ),
    grammarClarity: clamp(
      84 - Math.min(analysis.grammarIssues.length, 4) * 8 + Math.min(signals.actionVerbBullets, 5) * 2,
    ),
  };
}

function buildAtsBreakdown(
  analysis: AnalysisResult,
  signals: ResumeSignals,
  jobDescription?: string,
): AtsBreakdown {
  return {
    readability: clamp(68 + signals.sectionCount * 5),
    keywordMatching: clamp(jobDescription ? signals.keywordCoverage : 76),
    sectionStructure: clamp(60 + signals.sectionCount * 7),
    contactInfoDetection: clamp(
      (signals.hasEmail ? 35 : 0) + (signals.hasPhone ? 35 : 0) + (signals.hasLinkedIn ? 20 : 0),
    ),
    parsingFriendliness: clamp(
      64 + signals.sectionCount * 5 + (signals.hasEmail ? 6 : 0) + (signals.hasPhone ? 5 : 0),
    ),
  };
}

function weightedScore(breakdown: ScoreBreakdown) {
  return clamp(
    breakdown.formattingAtsStructure * 0.2 +
      breakdown.technicalSkillsRelevance * 0.2 +
      breakdown.projectQuality * 0.2 +
      breakdown.experienceImpactMetrics * 0.15 +
      breakdown.keywordCoverage * 0.15 +
      breakdown.grammarClarity * 0.1,
  );
}

function weightedAtsScore(breakdown: AtsBreakdown) {
  return clamp(
    breakdown.readability * 0.22 +
      breakdown.keywordMatching * 0.22 +
      breakdown.sectionStructure * 0.22 +
      breakdown.contactInfoDetection * 0.16 +
      breakdown.parsingFriendliness * 0.18,
  );
}

function correctMalformedScore(value: number | undefined, baseline: number) {
  if (value === undefined || Number.isNaN(value)) return baseline;

  const clampedInput = clamp(value);
  if (clampedInput <= 15 && baseline >= 60) {
    return clamp(Math.max(clampedInput * 8, baseline - 8));
  }
  if (clampedInput < baseline * 0.35 && baseline >= 60) {
    return clamp(Math.max(clampedInput * 4, baseline - 12));
  }
  return clampedInput;
}

function blendTowardBaseline(aiValue: number | undefined, baseline: number) {
  const corrected = correctMalformedScore(aiValue, baseline);
  const difference = Math.abs(corrected - baseline);
  if (difference >= 25) {
    return clamp(baseline * 0.8 + corrected * 0.2);
  }
  return clamp(baseline * 0.6 + corrected * 0.4);
}

function normalizeResumeScore(rawScore: number, signals: ResumeSignals) {
  const strengthSignals =
    (signals.sectionCount >= 4 ? 1 : 0) +
    (signals.quantifiedBullets >= 2 ? 1 : 0) +
    (signals.technicalSkillHits >= 5 ? 1 : 0) +
    (signals.projectMentions >= 1 ? 1 : 0);

  if (signals.profileType === "student" || signals.profileType === "fresher") {
    if (strengthSignals >= 3) return clamp(Math.max(rawScore, 74));
    if (strengthSignals >= 2) return clamp(Math.max(rawScore, 66));
  }

  if (strengthSignals >= 3) return clamp(Math.max(rawScore, 72));
  if (strengthSignals >= 2) return clamp(Math.max(rawScore, 62));
  return clamp(Math.max(rawScore, 40));
}

function capResumeScore(score: number, signals: ResumeSignals) {
  if (signals.profileType === "student") {
    return clamp(Math.min(score, signals.experienceMentions > 0 ? 88 : 84));
  }
  if (signals.profileType === "fresher") {
    return clamp(Math.min(score, signals.experienceMentions > 1 ? 89 : 86));
  }
  if (signals.profileType === "career-switcher") {
    return clamp(Math.min(score, 90));
  }
  return clamp(Math.min(score, 95));
}

function normalizeAtsScore(rawScore: number, signals: ResumeSignals) {
  const atsSignals =
    (signals.hasEmail ? 1 : 0) +
    (signals.hasPhone ? 1 : 0) +
    (signals.sectionCount >= 4 ? 1 : 0) +
    (signals.technicalSkillHits >= 4 ? 1 : 0);

  if (atsSignals >= 4) return clamp(Math.max(rawScore, 74));
  if (atsSignals >= 3) return clamp(Math.max(rawScore, 66));
  return clamp(Math.max(rawScore, 45));
}

function computeUnifiedScores(
  analysis: AnalysisResult,
  signals: ResumeSignals,
  jobDescription?: string,
): UnifiedScores {
  const heuristicBreakdown = buildScoreBreakdown(analysis, signals, jobDescription);
  const heuristicAtsBreakdown = buildAtsBreakdown(analysis, signals, jobDescription);

  const scoreBreakdown: ScoreBreakdown = {
    formattingAtsStructure: blendTowardBaseline(
      analysis.scoreBreakdown?.formattingAtsStructure,
      heuristicBreakdown.formattingAtsStructure,
    ),
    technicalSkillsRelevance: blendTowardBaseline(
      analysis.scoreBreakdown?.technicalSkillsRelevance,
      heuristicBreakdown.technicalSkillsRelevance,
    ),
    projectQuality: blendTowardBaseline(
      analysis.scoreBreakdown?.projectQuality,
      heuristicBreakdown.projectQuality,
    ),
    experienceImpactMetrics: blendTowardBaseline(
      analysis.scoreBreakdown?.experienceImpactMetrics,
      heuristicBreakdown.experienceImpactMetrics,
    ),
    keywordCoverage: blendTowardBaseline(
      analysis.scoreBreakdown?.keywordCoverage,
      heuristicBreakdown.keywordCoverage,
    ),
    grammarClarity: blendTowardBaseline(
      analysis.scoreBreakdown?.grammarClarity,
      heuristicBreakdown.grammarClarity,
    ),
  };

  const atsBreakdown: AtsBreakdown = {
    readability: blendTowardBaseline(analysis.atsBreakdown?.readability, heuristicAtsBreakdown.readability),
    keywordMatching: blendTowardBaseline(
      analysis.atsBreakdown?.keywordMatching,
      heuristicAtsBreakdown.keywordMatching,
    ),
    sectionStructure: blendTowardBaseline(
      analysis.atsBreakdown?.sectionStructure,
      heuristicAtsBreakdown.sectionStructure,
    ),
    contactInfoDetection: blendTowardBaseline(
      analysis.atsBreakdown?.contactInfoDetection,
      heuristicAtsBreakdown.contactInfoDetection,
    ),
    parsingFriendliness: blendTowardBaseline(
      analysis.atsBreakdown?.parsingFriendliness,
      heuristicAtsBreakdown.parsingFriendliness,
    ),
  };

  return {
    resumeScore: capResumeScore(normalizeResumeScore(weightedScore(scoreBreakdown), signals), signals),
    atsScore: normalizeAtsScore(weightedAtsScore(atsBreakdown), signals),
    scoreBreakdown,
    atsBreakdown,
  };
}

function baseSectionScore(
  section: string,
  scoreBreakdown: ScoreBreakdown,
  unifiedScores: UnifiedScores,
  signals: ResumeSignals,
) {
  const normalized = section.toLowerCase();
  const resumeAnchor = unifiedScores.resumeScore;
  if (normalized.includes("project")) {
    return clamp(Math.max(resumeAnchor + 2, scoreBreakdown.projectQuality + (signals.profileType === "student" ? 4 : 0)));
  }
  if (normalized.includes("skill")) {
    return clamp(Math.max(resumeAnchor + 3, scoreBreakdown.technicalSkillsRelevance + 3));
  }
  if (normalized.includes("education")) {
    const studentBase = signals.profileType === "student" ? 78 : 70;
    return clamp(
      Math.max(
        studentBase,
        resumeAnchor - 2,
        (scoreBreakdown.grammarClarity + scoreBreakdown.keywordCoverage) / 2,
      ),
    );
  }
  if (normalized.includes("experience")) {
    const experienceFloor = signals.profileType === "student" ? resumeAnchor - 6 : resumeAnchor - 3;
    return clamp(Math.max(experienceFloor, scoreBreakdown.experienceImpactMetrics + 4));
  }
  if (normalized.includes("summary")) {
    return clamp(Math.max(resumeAnchor - 5, (scoreBreakdown.keywordCoverage + scoreBreakdown.grammarClarity) / 2));
  }
  return clamp(Math.max(resumeAnchor - 4, (scoreBreakdown.grammarClarity + scoreBreakdown.keywordCoverage) / 2));
}

function normalizeSectionFeedback(
  sectionFeedback: AnalysisResult["sectionFeedback"],
  unifiedScores: UnifiedScores,
  signals: ResumeSignals,
): SectionFeedback {
  const normalizedEntries = Object.entries(sectionFeedback).map(([section, feedback]) => {
    const base = baseSectionScore(section, unifiedScores.scoreBreakdown, unifiedScores, signals);
    const adjustedScore = clamp(base);
    return [
      section,
      {
        ...feedback,
        score: adjustedScore,
        status: adjustedScore >= 78 ? "strong" : adjustedScore < 45 ? "missing" : "needs-work",
      },
    ] as const;
  });

  return Object.fromEntries(normalizedEntries);
}

function sharpenWeakness(item: string, signals: ResumeSignals) {
  const normalized = item.toLowerCase();
  if (normalized.includes("limited work experience") && signals.profileType === "student") {
    return "Adding internship experience, open-source contributions, or production-style deployments could strengthen industry readiness.";
  }
  if (normalized.includes("lack of experience") && signals.profileType === "student") {
    return "Use project bullets to show stronger ownership, quantified outcomes, and technical decision-making at a production-minded level.";
  }
  if (normalized.includes("generic") || normalized.includes("weak")) {
    return "Sharpening the most relevant bullets with clearer scope, stronger results, and role-specific keywords would improve recruiter confidence.";
  }
  if (normalized.length < 35) {
    return `${item}. Add one concrete metric, keyword, or outcome to make this area more convincing.`;
  }
  return item;
}

function sharpenBullets(bullets: string[], analysis: AnalysisResult) {
  const skillHint = analysis.skills[0]?.name ?? "modern engineering tools";
  return bullets.map((bullet) => {
    if (/\d/.test(bullet)) return bullet;
    return bullet.replace(/\.$/, "") + ` using ${skillHint}, with clearer impact, sharper ATS keywords, and stronger recruiter-facing phrasing.`;
  });
}

export function calibrateAnalysis(
  analysis: AnalysisResult,
  resumeText: string,
  jobDescription?: string,
): AnalysisResult {
  const signals = extractSignals(resumeText, analysis, jobDescription);
  const unifiedScores = computeUnifiedScores(analysis, signals, jobDescription);
  const normalizedSectionFeedback = normalizeSectionFeedback(
    analysis.sectionFeedback,
    unifiedScores,
    signals,
  );

  const sortedSections = Object.entries(normalizedSectionFeedback).sort(
    (a, b) => (b[1].score ?? 0) - (a[1].score ?? 0),
  );

  return {
    ...analysis,
    resumeScore: unifiedScores.resumeScore,
    atsScore: unifiedScores.atsScore,
    jdMatchPercentage: clamp(
      analysis.jdMatchPercentage ??
        (jobDescription
          ? unifiedScores.scoreBreakdown.keywordCoverage
          : Math.min(unifiedScores.resumeScore, unifiedScores.atsScore)),
    ),
    weaknesses: analysis.weaknesses.map((item) => sharpenWeakness(item, signals)),
    rewrittenBullets: sharpenBullets(analysis.rewrittenBullets, analysis),
    sectionFeedback: normalizedSectionFeedback,
    scoreBreakdown: unifiedScores.scoreBreakdown,
    atsBreakdown: unifiedScores.atsBreakdown,
    recruiterInsights: {
      profileType: analysis.recruiterInsights?.profileType ?? signals.profileType,
      strongestSection: analysis.recruiterInsights?.strongestSection ?? sortedSections[0]?.[0] ?? "experience",
      weakestSection: analysis.recruiterInsights?.weakestSection ?? sortedSections.at(-1)?.[0] ?? "summary",
      estimatedRecruiterImpression:
        analysis.recruiterInsights?.estimatedRecruiterImpression ??
        (unifiedScores.resumeScore >= 80
          ? "Strong technical resume with credible evidence and recruiter-friendly structure."
          : unifiedScores.resumeScore >= 65
            ? "Solid engineering resume with clear strengths and a few areas to sharpen."
            : "Promising foundation, but it needs stronger positioning and clearer impact."),
      interviewReadiness:
        analysis.recruiterInsights?.interviewReadiness ??
        (unifiedScores.resumeScore >= 80
          ? "High for internships and early-career engineering roles."
          : unifiedScores.resumeScore >= 65
            ? "Moderate to high once a few bullets are strengthened."
            : "Early-stage; improve resume impact before broad outreach."),
      interviewProbabilityEstimate:
        analysis.recruiterInsights?.interviewProbabilityEstimate ??
        (unifiedScores.resumeScore >= 80
          ? "High"
          : unifiedScores.resumeScore >= 65
            ? "Moderate"
            : "Low to moderate"),
      atsPassLikelihood:
        analysis.recruiterInsights?.atsPassLikelihood ??
        (unifiedScores.atsScore >= 80
          ? "Likely"
          : unifiedScores.atsScore >= 65
            ? "Moderate"
            : "At risk"),
      strongestRecruiterSignal:
        analysis.recruiterInsights?.strongestRecruiterSignal ??
        (signals.profileType === "student"
          ? "Project quality and modern technical stack"
          : "Relevant technical impact and role alignment"),
      hiringRiskFactors:
        analysis.recruiterInsights?.hiringRiskFactors ??
        [
          unifiedScores.resumeScore < 75 ? "Some bullets still need sharper impact framing." : "Few major hiring risks detected.",
          analysis.missingKeywords.length > 0 ? "A few target-role keywords are still missing." : "Keyword coverage is generally healthy.",
        ],
    },
  };
}
