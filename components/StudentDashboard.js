'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ResumeUpload from './ResumeUpload'
import Navbar from './Navbar'
import toast from 'react-hot-toast'

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Load student data
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile({ ...profileData, ...studentData })

      // Load applications
      const { data: applicationsData } = await supabase
        .from('applications')
        .select(`
          *,
          job_postings (
            title,
            description,
            required_skills
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      setApplications(applicationsData || [])

      // Load available jobs
      const { data: jobsData } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false })

      setJobs(jobsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (jobId) => {
    if (!profile?.resume_url) {
      toast.error('Please upload your resume first')
      return
    }

    try {
      // Fetch resume text (we'll need to store this or extract again)
      const response = await fetch('/api/upload')
      // For now, we'll trigger the scoring from the apply page
      router.push(`/student/apply/${jobId}`)
    } catch (error) {
      toast.error('Failed to apply')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-navy text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <Navbar userRole="student" userName={profile?.name} />
      <div className="p-8">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue">
          <h2 className="text-navy text-xl font-semibold mb-4">Your Profile</h2>
          {profile && (
            <div className="space-y-2">
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              {profile.linkedin_url && (
                <p>
                  <strong>LinkedIn:</strong>{' '}
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
                    {profile.linkedin_url}
                  </a>
                </p>
              )}
              {profile.github_url && (
                <p>
                  <strong>GitHub:</strong>{' '}
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
                    {profile.github_url}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Resume Upload */}
        <ResumeUpload onUploadComplete={loadData} />

        {/* Applications */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue lg:col-span-2">
          <h2 className="text-navy text-xl font-semibold mb-4">Your Applications</h2>
          {applications.length === 0 ? (
            <p className="text-gray-600">No applications yet</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="border border-blue rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-navy">
                        {app.job_postings?.title || 'Job'}
                      </h3>
                      {app.resume_score !== null && (
                        <p className="text-sm text-gray-600 mt-1">
                          Match Score: <span className="font-semibold">{app.resume_score}%</span>
                        </p>
                      )}
                      {app.missing_skills && app.missing_skills.length > 0 && (
                        <p className="text-sm text-red mt-1">
                          Missing Skills: {app.missing_skills.join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Status: <span className="capitalize">{app.status}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Jobs */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue lg:col-span-2">
          <h2 className="text-navy text-xl font-semibold mb-4">Available Jobs</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-600">No jobs available</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border border-blue rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-navy text-lg">{job.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-navy">Required Skills:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {job.required_skills.map((skill, idx) => (
                              <span key={idx} className="bg-blue text-white px-2 py-1 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleApply(job.id)}
                      className="ml-4 bg-navy text-cream px-4 py-2 rounded-lg hover:opacity-90 font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

