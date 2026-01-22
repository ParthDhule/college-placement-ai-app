'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from './Navbar'
import toast from 'react-hot-toast'

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [showJobForm, setShowJobForm] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    required_skills: '',
  })
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
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

      setProfile(profileData)

      // Load jobs
      const { data: jobsData } = await supabase
        .from('job_postings')
        .select('*')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false })

      setJobs(jobsData || [])

      // Load applications for recruiter's jobs
      const { data: applicationsData } = await supabase
        .from('applications')
        .select(`
          *,
          job_postings!inner (
            id,
            title,
            recruiter_id
          ),
          students (
            id,
            profiles (
              name,
              email
            )
          )
        `)
        .eq('job_postings.recruiter_id', user.id)
        .order('created_at', { ascending: false })

      setApplications(applicationsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateJob = async (e) => {
    e.preventDefault()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const skillsArray = newJob.required_skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      const { error } = await supabase
        .from('job_postings')
        .insert({
          recruiter_id: user.id,
          title: newJob.title,
          description: newJob.description,
          required_skills: skillsArray,
        })

      if (error) throw error

      toast.success('Job posted successfully!')
      setShowJobForm(false)
      setNewJob({ title: '', description: '', required_skills: '' })
      loadData()
    } catch (error) {
      toast.error(error.message || 'Failed to create job')
    }
  }

  const handleReject = async (applicationId) => {
    try {
      const response = await fetch('/api/ai/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate feedback')
      }

      toast.success('Application rejected with AI feedback')
      loadData()
    } catch (error) {
      toast.error(error.message || 'Failed to reject application')
    }
  }

  const handleAccept = async (applicationId) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', applicationId)

      if (error) throw error

      toast.success('Application accepted!')
      loadData()
    } catch (error) {
      toast.error('Failed to accept application')
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
      <Navbar userRole="recruiter" userName={profile?.name} />
      <div className="p-8">
        <header className="bg-maroon text-cream p-4 rounded-t-lg mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
            <button
              onClick={() => setShowJobForm(!showJobForm)}
              className="bg-cream text-maroon px-4 py-2 rounded-lg hover:opacity-90 font-semibold"
            >
              {showJobForm ? 'Cancel' : 'Post New Job'}
            </button>
          </div>
        </header>

      {showJobForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue mb-6">
          <h2 className="text-navy text-xl font-semibold mb-4">Post New Job</h2>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Description
              </label>
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 border border-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Required Skills (comma-separated)
              </label>
              <input
                type="text"
                value={newJob.required_skills}
                onChange={(e) => setNewJob({ ...newJob, required_skills: e.target.value })}
                required
                placeholder="e.g., JavaScript, React, Node.js"
                className="w-full px-4 py-2 border border-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>
            <button
              type="submit"
              className="bg-navy text-cream px-6 py-3 rounded-lg hover:opacity-90 font-semibold"
            >
              Post Job
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Postings */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue">
          <h2 className="text-navy text-xl font-semibold mb-4">Your Job Postings</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-600">No jobs posted yet</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border border-blue rounded-lg p-4">
                  <h3 className="font-semibold text-navy">{job.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                  {job.required_skills && job.required_skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {job.required_skills.map((skill, idx) => (
                        <span key={idx} className="bg-blue text-white px-2 py-1 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue">
          <h2 className="text-navy text-xl font-semibold mb-4">Applications</h2>
          {applications.length === 0 ? (
            <p className="text-gray-600">No applications yet</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="border border-blue rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-navy">
                        {app.students?.profiles?.name || 'Student'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {app.job_postings?.title || 'Job'}
                      </p>
                      {app.resume_score !== null && (
                        <p className="text-sm text-gray-600 mt-1">
                          Match Score: <span className="font-semibold">{app.resume_score}%</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Status: <span className="capitalize">{app.status}</span>
                      </p>
                    </div>
                  </div>
                  {app.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAccept(app.id)}
                        className="bg-blue text-white px-4 py-2 rounded-lg hover:opacity-90 text-sm font-semibold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        className="bg-red text-white px-4 py-2 rounded-lg hover:opacity-90 text-sm font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {app.status === 'rejected' && app.ai_feedback && (
                    <div className="mt-3 p-3 bg-gray-100 rounded">
                      <p className="text-sm font-medium text-navy mb-1">AI Feedback:</p>
                      <p className="text-sm text-gray-600">{app.ai_feedback}</p>
                    </div>
                  )}
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

