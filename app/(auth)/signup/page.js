'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          name,
          role,
        })

      if (profileError) throw profileError

      // If student, create student record
      if (role === 'student') {
        await supabase
          .from('students')
          .insert({
            id: authData.user.id,
          })
      }

      toast.success('Account created! Please check your email to verify.')
      router.push('/login')
    } catch (error) {
      toast.error(error.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border-2 border-blue">
        <h1 className="text-3xl font-bold text-navy mb-6 text-center">Sign Up</h1>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-navy mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-navy mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-navy mb-1">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
            >
              <option value="student">Student</option>
              <option value="recruiter">Recruiter</option>
              <option value="tpo">TPO (Training & Placement Officer)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy text-cream px-6 py-3 rounded-lg hover:opacity-90 font-semibold disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

