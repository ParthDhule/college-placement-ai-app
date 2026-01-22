import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { extractTextFromPDF } from '@/lib/pdf-extractor'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Extract text from PDF
    const resumeText = await extractTextFromPDF(file)

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `resumes/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath)

    // Update student record with resume URL
    await supabase
      .from('students')
      .update({ resume_url: urlData.publicUrl })
      .eq('id', user.id)

    return NextResponse.json({
      resumeText,
      resumeUrl: urlData.publicUrl,
    })
  } catch (error) {
    console.error('Error uploading resume:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload resume' },
      { status: 500 }
    )
  }
}

