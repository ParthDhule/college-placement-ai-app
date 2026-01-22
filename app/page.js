import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border-2 border-blue">
        <h1 className="text-4xl font-bold text-navy mb-2">PlaceAI</h1>
        <p className="text-gray-600 mb-8">AI-Powered Placement Platform</p>
        
        <div className="space-y-4">
          <Link 
            href="/login"
            className="block w-full bg-navy text-cream px-6 py-3 rounded-lg hover:opacity-90 text-center font-semibold"
          >
            Login
          </Link>
          <Link 
            href="/signup"
            className="block w-full bg-blue text-white px-6 py-3 rounded-lg hover:opacity-90 text-center font-semibold"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}

