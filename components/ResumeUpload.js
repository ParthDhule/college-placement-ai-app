'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ResumeUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
    } else {
      toast.error('Please upload a PDF file')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      toast.success('Resume uploaded successfully!')
      if (onUploadComplete) {
        onUploadComplete(data)
      }
      setFile(null)
    } catch (error) {
      toast.error(error.message || 'Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue">
      <h2 className="text-navy text-xl font-semibold mb-4">Upload Resume</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            Select PDF File
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue file:text-white hover:file:bg-opacity-90"
          />
        </div>

        {file && (
          <div className="text-sm text-gray-600">
            Selected: {file.name}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-navy text-cream px-6 py-3 rounded-lg hover:opacity-90 font-semibold disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Resume'}
        </button>
      </div>
    </div>
  )
}

