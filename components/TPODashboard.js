'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from './Navbar'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function TPODashboard() {
  const [stats, setStats] = useState(null)
  const [skillGaps, setSkillGaps] = useState([])
  const [placementReadiness, setPlacementReadiness] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  const COLORS = ['#003049', '#669bbc', '#c1121f', '#780000', '#fdf0d5']

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

      // Load overall statistics
      const { data: students } = await supabase
        .from('students')
        .select('id')

      const { data: applications } = await supabase
        .from('applications')
        .select('*')

      const { data: jobs } = await supabase
        .from('job_postings')
        .select('id')

      setStats({
        totalStudents: students?.length || 0,
        totalApplications: applications?.length || 0,
        totalJobs: jobs?.length || 0,
        acceptedApplications: applications?.filter(a => a.status === 'accepted').length || 0,
        pendingApplications: applications?.filter(a => a.status === 'pending').length || 0,
        rejectedApplications: applications?.filter(a => a.status === 'rejected').length || 0,
      })

      // Load skill gap analysis
      const { data: skillGapData } = await supabase
        .rpc('get_skill_gaps')

      // If RPC doesn't exist, compute manually
      if (!skillGapData) {
        const skillCounts = {}
        applications?.forEach(app => {
          if (app.missing_skills && Array.isArray(app.missing_skills)) {
            app.missing_skills.forEach(skill => {
              skillCounts[skill] = (skillCounts[skill] || 0) + 1
            })
          }
        })

        const skillGapArray = Object.entries(skillCounts)
          .map(([skill, count]) => ({ skill, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)

        setSkillGaps(skillGapArray)
      } else {
        setSkillGaps(skillGapData)
      }

      // Calculate placement readiness
      const readinessData = []
      const scoreRanges = [
        { range: '0-40', min: 0, max: 40 },
        { range: '41-60', min: 41, max: 60 },
        { range: '61-80', min: 61, max: 80 },
        { range: '81-100', min: 81, max: 100 },
      ]

      scoreRanges.forEach(({ range, min, max }) => {
        const count = applications?.filter(app => 
          app.resume_score !== null && 
          app.resume_score >= min && 
          app.resume_score <= max
        ).length || 0
        readinessData.push({ range, count })
      })

      setPlacementReadiness(readinessData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
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
      <Navbar userRole="tpo" userName={profile?.name} />
      <div className="p-8">

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Students</h3>
          <p className="text-3xl font-bold text-navy">{stats?.totalStudents || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Applications</h3>
          <p className="text-3xl font-bold text-navy">{stats?.totalApplications || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Jobs</h3>
          <p className="text-3xl font-bold text-navy">{stats?.totalJobs || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Application Status Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue">
          <h2 className="text-navy text-xl font-semibold mb-4">Application Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Accepted', value: stats?.acceptedApplications || 0 },
                  { name: 'Pending', value: stats?.pendingApplications || 0 },
                  { name: 'Rejected', value: stats?.rejectedApplications || 0 },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Accepted', value: stats?.acceptedApplications || 0 },
                  { name: 'Pending', value: stats?.pendingApplications || 0 },
                  { name: 'Rejected', value: stats?.rejectedApplications || 0 },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Placement Readiness Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue">
          <h2 className="text-navy text-xl font-semibold mb-4">Placement Readiness</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={placementReadiness}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#669bbc" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skill Gap Analysis */}
      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue">
        <h2 className="text-navy text-xl font-semibold mb-4">Top Skill Gaps</h2>
        {skillGaps.length === 0 ? (
          <p className="text-gray-600">No skill gap data available</p>
        ) : (
          <div className="space-y-2">
            {skillGaps.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-navy">{item.skill}</span>
                <span className="text-red font-semibold">{item.count} students missing</span>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

