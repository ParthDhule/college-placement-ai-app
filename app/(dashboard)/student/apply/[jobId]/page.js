'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [job, setJob] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(true)
  const [scoring, setScoring] = useState(false)
  const [result, setResult] = useState(null)

  const loadJob = async () => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', params.jobId)
        .single()

      if (error) throw error
      setJob(data)
    } catch (error) {
      toast.error('Failed to load job details')
      router.push('/student/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadResume = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: student } = await supabase
        .from('students')
        .select('resume_url')
        .eq('id', user.id)
        .single()

      if (student?.resume_url) {
        // Fetch the resume file and extract text
        try {
          const response = await fetch(student.resume_url)
          const blob = await response.blob()
          const file = new File([blob], 'resume.pdf', { type: 'application/pdf' })
          
          // Extract text using our API
          const formData = new FormData()
          formData.append('file', file)
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
          
          const uploadData = await uploadResponse.json()
          if (uploadData.resumeText) {
            setResumeText(uploadData.resumeText)
          }
        } catch (error) {
          console.error('Error extracting resume text:', error)
          // If extraction fails, user can still proceed but will need to re-upload
        }
      }
    } catch (error) {
      console.error('Error loading resume:', error)
    }
  }

  useEffect(() => {
    loadJob()
    loadResume()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.jobId])

  const handleScoreResume = async () => {
    if (!resumeText) {
      toast.error('Please upload your resume first')
      router.push('/student/dashboard')
      return
    }

    setScoring(true)

    try {
      const response = await fetch('/api/ai/score-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobId: params.jobId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Scoring failed')
      }

      setResult(data)
      toast.success('Resume scored successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to score resume')
    } finally {
      setScoring(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-navy text-xl">Loading...</div>
      </div>
    )
  }

  if (!job) {
    return null
  }

  return (
    <div className="bg-cream min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="bg-maroon text-cream p-4 rounded-t-lg mb-4">
          <h1 className="text-2xl font-bold">Apply for Job</h1>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue mb-6">
          <h2 className="text-navy text-xl font-semibold mb-4">{job.title}</h2>
          <p className="text-gray-600 mb-4">{job.description}</p>
          {job.required_skills && job.required_skills.length > 0 && (
            <div>
              <p className="font-medium text-navy mb-2">Required Skills:</p>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, idx) => (
                  <span key={idx} className="bg-blue text-white px-3 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {!result ? (
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue">
            {!resumeText ? (
              <div>
                <p className="text-gray-600 mb-4">Please upload your resume first to apply.</p>
                <button
                  onClick={() => router.push('/student/dashboard')}
                  className="bg-navy text-cream px-6 py-3 rounded-lg hover:opacity-90 font-semibold"
                >
                  Go to Dashboard to Upload Resume
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">Click below to score your resume against this job.</p>
                <button
                  onClick={handleScoreResume}
                  disabled={scoring}
                  className="bg-navy text-cream px-6 py-3 rounded-lg hover:opacity-90 font-semibold disabled:opacity-50"
                >
                  {scoring ? 'Scoring Resume...' : 'Score Resume & Apply'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue">
            <h2 className="text-navy text-xl font-semibold mb-4">Resume Match Results</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Match Percentage</p>
                <p className="text-3xl font-bold text-navy">{result.matchPercentage}%</p>
              </div>
              {result.matchedSkills && result.matchedSkills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-navy mb-2">Matched Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedSkills.map((skill, idx) => (
                      <span key={idx} className="bg-blue text-white px-3 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.missingSkills && result.missingSkills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red mb-2">Missing Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill, idx) => (
                      <span key={idx} className="bg-red text-white px-3 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.reasoning && (
                <div>
                  <p className="text-sm font-medium text-navy mb-2">Analysis:</p>
                  <p className="text-gray-600">{result.reasoning}</p>
                </div>
              )}
              <button
                onClick={() => router.push('/student/dashboard')}
                className="bg-navy text-cream px-6 py-3 rounded-lg hover:opacity-90 font-semibold"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

