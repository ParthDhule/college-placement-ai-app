# PlaceAI MVP - AI-Powered Placement Platform

A Next.js application for college placement management with AI-powered resume scoring and feedback generation.

## Features

- **Student Dashboard**: Upload resume, view applications, and see match scores
- **Recruiter Dashboard**: Post jobs, review applications, and generate AI feedback
- **TPO Dashboard**: Analytics, skill gap analysis, and placement readiness metrics

## Tech Stack

- Next.js 14 (App Router) with JavaScript
- Supabase (Auth + PostgreSQL Database)
- Google Gemini API for AI features
- Tailwind CSS for styling
- Recharts for analytics

## Setup

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
  
   Plan {SQL code} as follows : 

  -- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('student', 'recruiter', 'tpo')),
  name TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  linkedin_url TEXT,
  github_url TEXT,
  resume_url TEXT, -- Supabase Storage URL
  created_at TIMESTAMP DEFAULT NOW()
);

-- Job Postings table
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  required_skills TEXT[], -- Array of skills
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  job_id UUID REFERENCES job_postings(id),
  resume_score INTEGER, -- 0-100
  missing_skills TEXT[], -- Array from AI
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  ai_feedback TEXT, -- Generated feedback for rejections
  created_at TIMESTAMP DEFAULT NOW()
);

-- Skill Gap Analytics (materialized view or computed)
-- This will be computed via SQL queries, not a separate table




   - Create a storage bucket named `resumes`
   - Set up Row Level Security policies

4. Run the development server:
```bash
npm run dev
```

## Database Schema

See the plan document for the complete database schema. The main tables are:
- `profiles` - User profiles with roles
- `students` - Student-specific data
- `job_postings` - Job listings
- `applications` - Application records with AI scores

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_GEMINI_API_KEY` - Your Google Gemini API key

## Project Structure

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

