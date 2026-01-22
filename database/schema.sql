-- PlaceAI MVP Database Schema

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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - adjust based on your security requirements)
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own student data"
  ON students FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own student data"
  ON students FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view job postings"
  ON job_postings FOR SELECT
  USING (true);

CREATE POLICY "Recruiters can create job postings"
  ON job_postings FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can view their own job postings"
  ON job_postings FOR SELECT
  USING (auth.uid() = recruiter_id OR true);

CREATE POLICY "Students can view their own applications"
  ON applications FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Recruiters can view applications for their jobs"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = applications.job_id
      AND job_postings.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Students can create applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Recruiters can update applications for their jobs"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = applications.job_id
      AND job_postings.recruiter_id = auth.uid()
    )
  );

-- Create storage bucket for resumes (run this in Supabase Storage)
-- CREATE BUCKET resumes WITH PUBLIC true;

