import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateFeedback } from '@/lib/ai/gemini'

export async function POST(request) {
  try {
    const { applicationId } = await request.json()

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing application ID' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get application details
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        job_postings (
          title
        )
      `)
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Generate feedback
    const feedback = await generateFeedback(
      application.missing_skills || [],
      application.job_postings.title
    )

    // Update application with feedback
    await supabase
      .from('applications')
      .update({
        ai_feedback: feedback.message,
        status: 'rejected',
      })
      .eq('id', applicationId)

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Error generating feedback:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate feedback' },
      { status: 500 }
    )
  }
}

