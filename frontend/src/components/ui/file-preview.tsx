'use client'

import { useState } from 'react'

interface FilePreviewProps {
  url: string
  mimeType: string
  filename: string
  onClose?: () => void
}

export default function FilePreview({ url, mimeType, filename, onClose }: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isImage = mimeType.includes('png') || mimeType.includes('jpeg')
  const isPdf = mimeType.includes('pdf')
  const isDocx = mimeType.includes('word') || mimeType.includes('docx')
  const isCsv = mimeType.includes('csv')

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setError('Failed to load file')
  }

  const getFileIcon = () => {
    if (isPdf) return '📄'
    if (isDocx) return '📝'
    if (isCsv) return '📊'
    if (isImage) return '🖼️'
    return '📎'
  }

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          ✕
        </button>
      )}

      <div className="p-4">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <div className="animate-spin text-3xl">⏳</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading preview...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <div className="text-3xl">❌</div>
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            {isImage && (
              <div className="relative">
                <img
                  src={url}
                  alt={filename}
                  onLoad={handleLoad}
                  onError={handleError}
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}

            {isPdf && (
              <div className="space-y-4">
                <iframe
                  src={url}
                  className="w-full h-96 rounded-lg border border-gray-200 dark:border-gray-700"
                  onLoad={handleLoad}
                  onError={handleError}
                  title={filename}
                />
              </div>
            )}

            {isDocx && (
              <div className="space-y-4">
                <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center space-y-2">
                    <div className="text-6xl">{getFileIcon()}</div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      DOCX Preview
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Preview not available for DOCX files
                    </p>
                    <a
                      href={url}
                      download={filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Download File
                    </a>
                  </div>
                </div>
              </div>
            )}

            {isCsv && (
              <div className="space-y-4">
                <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center space-y-2">
                    <div className="text-6xl">{getFileIcon()}</div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      CSV File
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Preview not available for CSV files
                    </p>
                    <a
                      href={url}
                      download={filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Download File
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {filename}
          </p>
        </div>
      </div>
    </div>
  )
}
