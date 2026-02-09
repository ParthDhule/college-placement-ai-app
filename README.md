# 🚀 Talent Track - AI-Powered Placement Management Platform

**Built with Firebase Studio 🔥 / Vibe Coded App 🧩 **

A Next.js application for college placement management with AI-powered resume scoring and feedback generation.🏆

## Features ✨

- **Student Dashboard**: Upload resume, view applications, and see match scores
- **Recruiter Dashboard**: Post jobs, review applications, and generate AI feedback
- **TPO Dashboard**: Analytics, skill gap analysis, and placement readiness metrics

## Tech Stack ⚙

- Next.js 14 (App Router) with JavaScript
- Supabase (Auth + PostgreSQL Database)
- Google Gemini API for AI features
- Tailwind CSS for styling
- Recharts for analytics

## Setup 🛠

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in your Supabase and Gemini API credentials.

3. Set up Supabase:
   - Create a new Supabase project
   - Run the database schema SQL (see plan document)
   - Create a storage bucket named `resumes`
   - Set up Row Level Security policies

4. Run the development server:
```bash
npm run dev
```

## Database Schema 🔐

See the plan document for the complete database schema. The main tables are:
- `profiles` - User profiles with roles
- `students` - Student-specific data
- `job_postings` - Job listings
- `applications` - Application records with AI scores

## Environment Variables 🔐

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_GEMINI_API_KEY` - Your Google Gemini API key

## Project Structure 🏛

```
app/
├── (auth)/          # Authentication pages
├── (dashboard)/     # Dashboard pages for each role
├── api/             # API routes
└── layout.js        # Root layout

components/          # React components
lib/                 # Utility functions
  ├── supabase/      # Supabase clients
  ├── ai/            # AI utilities
  └── pdf-extractor.js
```

