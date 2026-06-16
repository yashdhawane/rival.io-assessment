'use client'

import { useState, useRef, useCallback } from 'react'
import axios from 'axios'

interface FileUploadProps {
  taskId: string
  onUploadSuccess: (attachment: any) => void
  onUploadError?: (error: string) => void
}

interface UploadState {
  file: File | null
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  error: string | null
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'image/png',
  'image/jpeg',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function FileUpload({ taskId, onUploadSuccess, onUploadError }: FileUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    progress: 0,
    status: 'idle',
    error: null,
  })
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: PDF, DOCX, CSV, PNG, JPEG`,
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      }
    }

    return { valid: true }
  }

  const handleFileSelect = useCallback((file: File) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      setUploadState({
        file: null,
        progress: 0,
        status: 'error',
        error: validation.error || 'Invalid file',
      })
      onUploadError?.(validation.error || 'Invalid file')
      return
    }

    setUploadState({
      file,
      progress: 0,
      status: 'idle',
      error: null,
    })
  }, [onUploadError])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const uploadToCloudinary = async (file: File, signature: any): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', signature.apiKey)
    formData.append('timestamp', signature.timestamp.toString())
    formData.append('signature', signature.signature)
    formData.append('folder', signature.folder || 'task_attachments')
    formData.append('public_id', signature.publicId)

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          setUploadState((prev) => ({ ...prev, progress }))
        },
      }
    )

    return response.data.secure_url
  }

  const handleUpload = async () => {
    if (!uploadState.file) return

    setUploadState((prev) => ({ ...prev, status: 'uploading', progress: 0, error: null }))

    try {
      

      // Get upload signature from backend
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const signatureResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attachments/tasks/${taskId}/attachments/signature`,
        {
          filename: uploadState.file.name,
          mimeType: uploadState.file.type,
          size: uploadState.file.size,
        },
        {
          withCredentials: true,
          headers,
        }
      )

      if (!signatureResponse.data.success) {
        throw new Error(signatureResponse.data.error?.message || 'Failed to get upload signature')
      }

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(uploadState.file, signatureResponse.data.data)

      // Save metadata to backend
      const metadataResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attachments/tasks/${taskId}/attachments/metadata`,
        {
          filename: signatureResponse.data.data.publicId,
          originalName: uploadState.file.name,
          mimeType: uploadState.file.type,
          size: uploadState.file.size,
          url: cloudinaryUrl,
          publicId: signatureResponse.data.data.publicId,
        },
        {
          withCredentials: true,
          headers,
        }
      )

      if (!metadataResponse.data.success) {
        throw new Error(metadataResponse.data.error?.message || 'Failed to save attachment metadata')
      }

      setUploadState({
        file: null,
        progress: 100,
        status: 'success',
        error: null,
      })

      onUploadSuccess(metadataResponse.data.data)

      // Reset after success
      setTimeout(() => {
        setUploadState({
          file: null,
          progress: 0,
          status: 'idle',
          error: null,
        })
      }, 2000)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Upload failed'
      setUploadState({
        file: uploadState.file,
        progress: 0,
        status: 'error',
        error: errorMessage,
      })
      onUploadError?.(errorMessage)
    }
  }

  const handleCancel = () => {
    setUploadState({
      file: null,
      progress: 0,
      status: 'idle',
      error: null,
    })
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word') || mimeType.includes('docx')) return '📝'
    if (mimeType.includes('csv')) return '📊'
    if (mimeType.includes('png') || mimeType.includes('jpeg')) return '🖼️'
    return '📎'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        } ${uploadState.status === 'uploading' ? 'pointer-events-none opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.csv,.png,.jpeg,.jpg"
          onChange={handleInputChange}
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {uploadState.file ? uploadState.file.name : 'Drag & drop a file here, or click to select'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Supported formats: PDF, DOCX, CSV, PNG, JPEG (max 10MB)
          </p>
        </div>

        {!uploadState.file && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Select File
          </button>
        )}
      </div>

      {uploadState.file && uploadState.status !== 'success' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getFileIcon(uploadState.file.type)}</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {uploadState.file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(uploadState.file.size)}
                </p>
              </div>
            </div>
            {uploadState.status === 'idle' && (
              <button
                type="button"
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            )}
          </div>

          {uploadState.status === 'uploading' && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Uploading... {uploadState.progress}%
              </p>
            </div>
          )}

          {uploadState.status === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{uploadState.error}</p>
              <div className="flex space-x-2 mt-2">
                <button
                  type="button"
                  onClick={handleUpload}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {uploadState.status === 'idle' && (
            <button
              type="button"
              onClick={handleUpload}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Upload File
            </button>
          )}
        </div>
      )}

      {uploadState.status === 'success' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                File uploaded successfully
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {uploadState.file?.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
