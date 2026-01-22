import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export async function scoreResume(resumeText, jobDescription) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `You are an expert recruiter analyzing a resume against a job description.

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
Title: ${jobDescription.title}
Required Skills: ${jobDescription.requiredSkills.join(', ')}
Description: ${jobDescription.description}

Analyze the resume and return ONLY a valid JSON object with this exact structure:
{
  "matchPercentage": <number 0-100>,
  "missingSkills": [<array of skill strings>],
  "matchedSkills": [<array of skill strings>],
  "reasoning": "<brief explanation in 1-2 sentences>"
}

Be strict but fair. Only include skills that are explicitly mentioned in the job requirements.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response (handle markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const jsonData = JSON.parse(jsonMatch[0])
    return jsonData
  } catch (error) {
    console.error('Error scoring resume:', error)
    throw error
  }
}

export async function generateFeedback(missingSkills, jobTitle) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `A student was rejected for this job posting.

Job Title: ${jobTitle}
Missing Skills: ${missingSkills.join(', ')}

Generate constructive feedback in this JSON format:
{
  "recommendation": "<What they should learn>",
  "resourceLink": "<A relevant learning resource URL>",
  "message": "<Encouraging 2-3 sentence message>"
}

Make it encouraging and actionable. Provide a real learning resource URL (e.g., freeCodeCamp, Coursera, MDN Web Docs).`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const jsonData = JSON.parse(jsonMatch[0])
    return jsonData
  } catch (error) {
    console.error('Error generating feedback:', error)
    throw error
  }
}

