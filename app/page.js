import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-sky-200 via-blue-200 to-indigo-200 ">
    <section className="py-24 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full border border-blue-300 animate-fadeInScale">
       
       {/*title*/}
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-2 animate-slideDown">Talent Track</h1>
        <p className="text-gray-600 text-center mb-8 animate-fadeIn">AI-Powered Placement Platform</p>
        
        {/*Buttons*/}
        <div className="space-y-4">
          <Link 
            href="/login"
            className="block w-full bg-sky-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-sky-600 hover:scale-105 active:scale-95 shadow-mdS text-center"
          >
            Login
          </Link>
          <Link 
            href="/signup"
            className="block w-full bg-sky-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-sky-600 hover:scale-105 active:scale-95 shadow-md text-center"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </section>

    {/*About section*/}
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className='text-3xl fornt-bold text-blue-900 mb-4'>
          About Talent Track
        </h2>
        
        <p className='text-blue-800 text-lg leading-relaxed'>
          Talent Track is an AI-powered placement platform designed to connect Students, Recruiters, and Training and Placement Officers on a single smart dashboard. It simplifies hiring tracks student progress, and helps colleges achieve better placement outcomes with data-driven insights.
        </p>
      </div>
    </section>

    {/*Users Section*/}
    <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
            Who Can Use Talent Track?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Recruiters */}
            <div className="p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                Recruiters
              </h3>
              <p className="text-blue-700">
                Recruiters can easily post job openings, filter candidates using
                AI-based matching, and manage hiring pipelines efficiently.
              </p>
            </div>

            {/* Students */}
            <div className="p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                Students
              </h3>
              <p className="text-blue-700">
                Students can build profiles, track applications, receive
                personalized job recommendations, and prepare better for placements.
              </p>
            </div>

            {/* TPO */}
            <div className="p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                TPO (Training & Placement Officers)
              </h3>
              <p className="text-blue-700">
                TPOs can manage student data, monitor placement progress,
                coordinate with recruiters, and generate reports effortlessly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-6 text-center text-blue-800">
         {new Date().getFullYear()} Talent Track
      </footer>
    </div>
  )
}

