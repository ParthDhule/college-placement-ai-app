import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { scoreResume } from '@/lib/ai/gemini'

export async function POST(request) {
  try {
    const { resumeText, jobId } = await request.json()

    if (!resumeText || !jobId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Score resume using AI
    const jobDescription = {
      title: job.title,
      requiredSkills: job.required_skills || [],
      description: job.description || '',
    }

    const aiResult = await scoreResume(resumeText, jobDescription)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get student ID
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }

    // Create or update application
    const { data: existingApp } = await supabase
      .from('applications')
      .select('id')
      .eq('student_id', student.id)
      .eq('job_id', jobId)
      .single()

    const applicationData = {
      student_id: student.id,
      job_id: jobId,
      resume_score: aiResult.matchPercentage,
      missing_skills: aiResult.missingSkills,
      status: 'pending',
    }

    if (existingApp) {
      await supabase
        .from('applications')
        .update(applicationData)
        .eq('id', existingApp.id)
    } else {
      await supabase
        .from('applications')
        .insert(applicationData)
    }

    return NextResponse.json({
      matchPercentage: aiResult.matchPercentage,
      missingSkills: aiResult.missingSkills,
      matchedSkills: aiResult.matchedSkills,
      reasoning: aiResult.reasoning,
    })
  } catch (error) {
    console.error('Error scoring resume:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to score resume' },
      { status: 500 }
    )
  }
}

