export const RESUME_SCORING_PROMPT = `
You are an expert recruiter analyzing a resume against a job description.

RESUME TEXT:
{resumeText}

JOB DESCRIPTION:
Title: {jobTitle}
Required Skills: {requiredSkills}
Description: {jobDescription}

Analyze the resume and return ONLY a valid JSON object with this exact structure:
{
  "matchPercentage": <number 0-100>,
  "missingSkills": [<array of skill strings>],
  "matchedSkills": [<array of skill strings>],
  "reasoning": "<brief explanation in 1-2 sentences>"
}

Be strict but fair. Only include skills that are explicitly mentioned in the job requirements.
`

export const REJECTION_FEEDBACK_PROMPT = `
A student was rejected for this job posting.

Job Title: {jobTitle}
Missing Skills: {missingSkills}

Generate constructive feedback in this JSON format:
{
  "recommendation": "<What they should learn>",
  "resourceLink": "<A relevant learning resource URL>",
  "message": "<Encouraging 2-3 sentence message>"
}

Make it encouraging and actionable. Provide a real learning resource URL (e.g., freeCodeCamp, Coursera, MDN Web Docs).
`

