'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function Navbar({ userRole, userName }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  return (
    <nav className="bg-maroon text-cream p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Talent Track</h1>
          {userName && (
            <span className="text-sm opacity-90">Welcome, {userName}</span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="bg-cream text-maroon px-4 py-2 rounded-lg hover:opacity-90 font-semibold"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

