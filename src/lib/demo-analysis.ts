import type { AnalyzeResponse, AnalysisResult } from "@/types/resume";

export const demoAnalysis: AnalysisResult = {
  resumeScore: 84,
  atsScore: 81,
  jdMatchPercentage: 78,
  strengths: [
    "Strong project section with modern engineering tools and clear ownership.",
    "Good ATS structure with recognizable section headings and readable formatting.",
    "Solid technical stack coverage across frontend, backend, and deployment.",
  ],
  weaknesses: [
    "A few bullets could quantify impact more clearly with measurable outcomes.",
    "Summary positioning can be sharper for role-specific applications.",
  ],
  missingKeywords: ["system design", "testing", "observability"],
  skills: [
    { name: "React", level: "advanced", evidence: "Used across product and project work" },
    { name: "Next.js", level: "advanced", evidence: "Frontend architecture and deployment" },
    { name: "TypeScript", level: "advanced", evidence: "Typed full-stack implementation" },
    { name: "Node.js", level: "intermediate", evidence: "API and backend development" },
    { name: "Tailwind CSS", level: "advanced", evidence: "Component styling and responsive UI" },
  ],
  grammarIssues: [
    "A few bullets can be shortened for sharper recruiter scanning.",
  ],
  suggestions: {
    critical: [
      "Add measurable outcomes to 2-3 top bullets so recruiters can see impact faster.",
    ],
    important: [
      "Mirror more target-role keywords in the summary and skills section.",
      "Move the strongest technical project higher if applying to engineering-heavy roles.",
    ],
    optional: [
      "Trim older coursework details if space is tight.",
    ],
  },
  rewrittenBullets: [
    "Built and deployed a full-stack resume analysis platform with Next.js, TypeScript, and AI APIs, improving end-to-end analysis speed and recruiter-style feedback quality.",
    "Developed responsive dashboard workflows with chart visualizations and ATS insights, helping users identify weak sections and keyword gaps faster.",
  ],
  sectionFeedback: {
    summary: {
      score: 74,
      status: "needs-work",
      feedback: "The summary is competent, but it could align more directly with the target role and standout strengths.",
    },
    experience: {
      score: 83,
      status: "strong",
      feedback: "Experience reads clearly and shows relevant technical ownership, but stronger metrics would increase recruiter confidence.",
    },
    projects: {
      score: 88,
      status: "strong",
      feedback: "Projects are highly relevant and do a good job showing initiative, applied skills, and modern tooling.",
    },
    skills: {
      score: 82,
      status: "strong",
      feedback: "The stack is current and useful, with good breadth for software engineering roles.",
    },
    education: {
      score: 76,
      status: "needs-work",
      feedback: "Education is serviceable, though it does not add much differentiating value compared with the rest of the resume.",
    },
  },
  scoreBreakdown: {
    formattingAtsStructure: 86,
    technicalSkillsRelevance: 84,
    projectQuality: 88,
    experienceImpactMetrics: 75,
    keywordCoverage: 78,
    grammarClarity: 82,
  },
  atsBreakdown: {
    readability: 84,
    keywordMatching: 78,
    sectionStructure: 85,
    contactInfoDetection: 80,
    parsingFriendliness: 81,
  },
  recruiterInsights: {
    strongestSection: "Projects",
    weakestSection: "Summary",
    estimatedRecruiterImpression: "Strong early-career engineering resume with credible projects and modern stack relevance.",
    interviewReadiness: "High for internships, hackathons, and junior engineering roles.",
  },
};

export const demoResponse: AnalyzeResponse = {
  analysis: demoAnalysis,
  resumeText:
    "Demo resume preview. Built modern full-stack applications using Next.js, TypeScript, Tailwind CSS, and AI APIs. Delivered recruiter-style dashboards, responsive product experiences, and deployment-ready projects.",
  fileName: "demo-software-engineer-resume.pdf",
};
