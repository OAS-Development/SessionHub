'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFileUpload } from '@/lib/hooks/useFileUpload'
import {
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export interface FileUploadProps {
  onUploadComplete?: (results: any[]) => void
  onUploadError?: (error: string) => void
  projectId?: string
  sessionId?: string
  folder?: string
  tags?: string[]
  description?: string
  accept?: string[]
  maxFiles?: number
  maxFileSize?: number
  className?: string
}

export default function FileUpload({
  onUploadComplete,
  onUploadError,
  projectId,
  sessionId,
  folder,
  tags,
  description,
  accept,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  className = ''
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)

  const {
    files,
    uploading,
    results,
    errors,
    globalErrors,
    hasFiles,
    hasErrors,
    overallProgress,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    cancelUpload
  } = useFileUpload({
    onUploadComplete,
    onUploadError,
    onValidationError: (errors) => {
      console.warn('File validation errors:', errors)
    },
    maxFiles,
    acceptedFileTypes: accept,
    maxFileSize
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setDragActive(false)
    addFiles(acceptedFiles)
  }, [addFiles])

  const onDragEnter = useCallback(() => {
    setDragActive(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setDragActive(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter,
    onDragLeave,
    accept: accept ? accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}) : undefined,
    maxFiles,
    maxSize: maxFileSize,
    disabled: uploading
  })

  const handleUpload = async () => {
    await uploadFiles({
      projectId,
      sessionId,
      folder,
      tags,
      description
    })
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />
    }
    return <DocumentIcon className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive || dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive || dragActive ? 'Drop files here' : 'Upload files'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop files here, or click to select
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Max {maxFiles} files, up to {formatFileSize(maxFileSize)} each
            </p>
          </div>
        </div>

        {/* Upload Progress Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <ArrowPathIcon className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Uploading... {overallProgress}%</p>
              <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Errors */}
      {globalErrors.length > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Upload Errors</h3>
              <ul className="mt-2 text-sm text-red-600 space-y-1">
                {globalErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      {hasFiles && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Files to upload ({files.length})
            </h3>
            <div className="flex gap-2">
              {!uploading && (
                <>
                  <button
                    onClick={clearFiles}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={hasErrors}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${hasErrors 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }
                    `}
                  >
                    Upload Files
                  </button>
                </>
              )}
              {uploading && (
                <button
                  onClick={cancelUpload}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {files.map((file, index) => {
              const fileError = errors.find(e => e.filename === file.name)
              const hasError = fileError && fileError.errors.length > 0
              const hasWarning = fileError && fileError.warnings.length > 0

              return (
                <div
                  key={`${file.name}-${index}`}
                  className={`
                    flex items-center justify-between p-4 rounded-lg border
                    ${hasError 
                      ? 'border-red-200 bg-red-50' 
                      : hasWarning 
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                      
                      {/* Errors and Warnings */}
                      {fileError && (
                        <div className="mt-2 space-y-1">
                          {fileError.errors.map((error, idx) => (
                            <p key={idx} className="text-xs text-red-600 flex items-center">
                              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                              {error}
                            </p>
                          ))}
                          {fileError.warnings.map((warning, idx) => (
                            <p key={idx} className="text-xs text-yellow-600 flex items-center">
                              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                              {warning}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center ml-4">
                    {hasError && (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    {hasWarning && !hasError && (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    )}
                    {!hasError && !hasWarning && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    )}
                    
                    {!uploading && (
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upload Results */}
      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Complete</h3>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`
                  flex items-center justify-between p-4 rounded-lg border
                  ${result.success 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                  }
                `}
              >
                <div className="flex items-center">
                  {result.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {result.filename}
                    </p>
                    {result.success && result.result && (
                      <p className="text-sm text-gray-500">
                        {formatFileSize(result.result.size)} • {result.result.format.toUpperCase()}
                      </p>
                    )}
                    {!result.success && result.error && (
                      <p className="text-sm text-red-600">{result.error}</p>
                    )}
                  </div>
                </div>
                
                {result.success && result.result && (
                  <a
                    href={result.result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View File
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 