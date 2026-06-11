'use client'

import { useState } from 'react'
import { attachmentApi } from '@/lib/api'
import Button from '@/components/ui/button'
import FileUpload from '@/components/ui/file-upload'
import FilePreview from '@/components/ui/file-preview'

interface TaskAttachmentsProps {
  taskId: string
  attachments: any[]
  onAttachmentsChange: () => void
}

export default function TaskAttachments({ taskId, attachments, onAttachmentsChange }: TaskAttachmentsProps) {
  const [previewAttachment, setPreviewAttachment] = useState<any>(null)

  const handleDelete = async (attachmentId: string) => {
    try {
      await attachmentApi.delete(taskId, attachmentId)
      onAttachmentsChange()
    } catch (error: any) {
      console.error('Error deleting attachment:', error.response?.data?.error?.message || 'Failed to delete attachment')
    }
  }

  const handleUploadSuccess = (attachment: any) => {
    onAttachmentsChange()
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word') || mimeType.includes('docx')) return '📝'
    if (mimeType.includes('csv')) return '📊'
    if (mimeType.includes('png') || mimeType.includes('jpeg')) return '🖼️'
    return '📎'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Attachments</h3>
      </div>

      <FileUpload
        taskId={taskId}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />

      {attachments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No attachments yet</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewAttachment(attachment)}
                  className="text-2xl hover:scale-110 transition-transform"
                  title="Preview"
                >
                  {getFileIcon(attachment.mimeType)}
                </button>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {attachment.originalName}
                </a>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({formatFileSize(attachment.size)})
                </span>
              </div>
              <Button
                variant="danger"
                onClick={() => handleDelete(attachment.id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}

      {previewAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4">
              <FilePreview
                url={previewAttachment.url}
                mimeType={previewAttachment.mimeType}
                filename={previewAttachment.originalName}
                onClose={() => setPreviewAttachment(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
