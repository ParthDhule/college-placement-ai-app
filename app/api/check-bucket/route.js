import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      return NextResponse.json(
        { 
          error: 'Failed to list buckets',
          details: listError.message,
          buckets: null
        },
        { status: 500 }
      )
    }

    const resumesBucket = buckets.find(bucket => bucket.id === 'resumes')

    return NextResponse.json({
      exists: !!resumesBucket,
      bucket: resumesBucket,
      allBuckets: buckets.map(b => ({ id: b.id, name: b.name, public: b.public }))
    })
  } catch (error) {
    console.error('Error checking bucket:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to check bucket',
        exists: false
      },
      { status: 500 }
    )
  }
}

