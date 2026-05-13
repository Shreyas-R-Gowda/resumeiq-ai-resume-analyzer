# ResumeIQ - AI Resume Analyzer

Modern resume analysis MVP built with Next.js App Router, TypeScript, Tailwind CSS, reusable shadcn-style UI components, Groq, PDF/DOCX parsing, and Recharts.

## Features

- Drag-and-drop PDF or DOCX resume upload
- Server-side text extraction with `pdfjs-dist` and `mammoth`
- Secure Groq API route using `GROQ_API_KEY`
- OpenAI SDK compatibility via Groq's `https://api.groq.com/openai/v1` base URL
- Structured JSON-only AI response validation with Zod
- Optional job description input and JD match percentage
- Resume score, ATS score, missing keywords, grammar feedback, skills, section feedback, and rewritten bullets
- Responsive dashboard with charts and dark mode
- Downloadable PDF report
- Loading states and API error handling

## Installation Commands

```bash
npx create-next-app@latest ai-resume-analyzer --ts --tailwind --eslint --app --import-alias "@/*" --use-npm
cd ai-resume-analyzer
npm install openai pdfjs-dist mammoth recharts lucide-react zod class-variance-authority clsx tailwind-merge jspdf html2canvas @radix-ui/react-slot
```

This repository has already been scaffolded with those dependencies.

## Folder Structure

```text
src/
  app/
    api/analyze/route.ts
    dashboard/page.tsx
    upload/page.tsx
    page.tsx
    layout.tsx
    globals.css
  components/
    dashboard/
    ui/
    site-header.tsx
    upload-form.tsx
  lib/
    groq.ts
    pdf-parser.ts
    prompts.ts
    resume-parser.ts
    validation.ts
  types/
    resume.ts
  utils/
    cn.ts
```

## Environment Setup

Create `.env.local`:

```bash
cp .env.example .env.local
```

Then add your Groq key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

## Generate A Groq API Key

1. Open the [Groq Console](https://console.groq.com/keys).
2. Sign in or create an account.
3. Create a new API key.
4. Paste that key into `.env.local` as `GROQ_API_KEY`.

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Workflow

1. Visit the landing page.
2. Click **Start analysis**.
3. Upload a PDF or DOCX resume.
4. Optionally paste a job description.
5. Click **Analyze resume**.
6. Review the dashboard and download the PDF report.

## Backend Flow

`src/app/api/analyze/route.ts` receives multipart form data, validates the file, extracts resume text, calls Groq server-side, validates the JSON shape, and returns the dashboard payload.

The app uses:

- Groq API
- OpenAI SDK compatibility mode
- Base URL: `https://api.groq.com/openai/v1`
- Model: `llama-3.3-70b-versatile`

The model is instructed to act as:

- ATS system
- Recruiter
- Career coach

The response is forced into this validated JSON shape:

```json
{
  "resumeScore": 85,
  "atsScore": 78,
  "jdMatchPercentage": 72,
  "strengths": [],
  "weaknesses": [],
  "missingKeywords": [],
  "skills": [],
  "grammarIssues": [],
  "suggestions": {
    "critical": [],
    "important": [],
    "optional": []
  },
  "rewrittenBullets": [],
  "sectionFeedback": {}
}
```

The response parser also:

- strips markdown code fences if the model returns them
- extracts the JSON object from noisy output
- validates the final object with Zod
- returns useful API errors when parsing fails

## Deployment To Vercel

1. Push the project to GitHub.
2. Import the repo in Vercel.
3. Add `GROQ_API_KEY` in the Vercel environment settings.
4. Deploy.

The Groq API key stays server-side in the API route and is never exposed to the browser.

## Bonus Feature Ideas

- Clerk or Auth.js authentication
- Database storage for previous analyses
- AI-generated cover letters
- Resume tailoring for a specific job
- Multi-resume comparison
