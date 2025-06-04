'use client'

import { useState, useCallback, useRef } from 'react'

// Types for file upload
interface FileUploadState {
  files: File[]
  uploading: boolean
  progress: Record<string, number>
  completed: string[]
  errors: Record<string, string>
  results: Record<string, any>
}

interface FileUploadOptions {
  projectId?: string
  sessionId?: string
  folder?: string
  tags?: string[]
  description?: string
  maxFiles?: number
  maxSize?: number
  allowedTypes?: string[]
}

interface UploadResult {
  success: boolean
  data?: {
    uploads: Array<{
      filename: string
      uploadId: string
      success: boolean
      result?: any
      error?: string
    }>
    errors: any[]
    summary: {
      totalFiles: number
      successful: number
      failed: number
      successRate: number
    }
  }
  error?: string
}

export function useFileUpload(options: FileUploadOptions = {}) {
  const [state, setState] = useState<FileUploadState>({
    files: [],
    uploading: false,
    progress: {},
    completed: [],
    errors: {},
    results: {}
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  // Add files to upload queue
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const filesArray = Array.from(newFiles)
    const maxFiles = options.maxFiles || 10
    const maxSize = options.maxSize || 10 * 1024 * 1024 // 10MB default
    const allowedTypes = options.allowedTypes || []

    // Validate files
    const validFiles: File[] = []
    const newErrors: Record<string, string> = {}

    filesArray.forEach((file, index) => {
      const fileKey = `${file.name}_${index}`

      // Check file size
      if (file.size > maxSize) {
        newErrors[fileKey] = `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`
        return
      }

      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        newErrors[fileKey] = `File type ${file.type} not allowed`
        return
      }

      validFiles.push(file)
    })

    setState(prev => {
      const totalFiles = prev.files.length + validFiles.length
      if (totalFiles > maxFiles) {
        const allowedCount = maxFiles - prev.files.length
        return {
          ...prev,
          files: [...prev.files, ...validFiles.slice(0, allowedCount)],
          errors: {
            ...prev.errors,
            ...newErrors,
            overflow: `Can only upload ${maxFiles} files maximum`
          }
        }
      }

      return {
        ...prev,
        files: [...prev.files, ...validFiles],
        errors: { ...prev.errors, ...newErrors }
      }
    })
  }, [options.maxFiles, options.maxSize, options.allowedTypes])

  // Remove file from queue
  const removeFile = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
      errors: Object.fromEntries(
        Object.entries(prev.errors).filter(([key]) => !key.startsWith(prev.files[index]?.name))
      )
    }))
  }, [])

  // Clear all files
  const clearFiles = useCallback(() => {
    setState(prev => ({
      ...prev,
      files: [],
      progress: {},
      completed: [],
      errors: {},
      results: {}
    }))
  }, [])

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  // Upload files
  const uploadFiles = useCallback(async (): Promise<UploadResult> => {
    if (state.files.length === 0) {
      return { success: false, error: 'No files to upload' }
    }

    setState(prev => ({ ...prev, uploading: true, errors: {}, progress: {} }))
    abortControllerRef.current = new AbortController()

    try {
      // Convert files to base64
      const filesData = await Promise.all(
        state.files.map(async (file, index) => {
          const fileKey = `${file.name}_${index}`
          setState(prev => ({
            ...prev,
            progress: { ...prev.progress, [fileKey]: 10 }
          }))

          const content = await fileToBase64(file)
          
          setState(prev => ({
            ...prev,
            progress: { ...prev.progress, [fileKey]: 30 }
          }))

          return {
            filename: file.name,
            content,
            type: file.type,
            size: file.size
          }
        })
      )

      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: filesData,
          options
        }),
        signal: abortControllerRef.current.signal
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Update progress to complete
      const finalProgress: Record<string, number> = {}
      const finalResults: Record<string, any> = {}
      const completed: string[] = []

      state.files.forEach((file, index) => {
        const fileKey = `${file.name}_${index}`
        finalProgress[fileKey] = 100
        
        const uploadResult = result.data.uploads.find((u: any) => u.filename === file.name)
        if (uploadResult && uploadResult.success) {
          finalResults[fileKey] = uploadResult.result
          completed.push(fileKey)
        }
      })

      setState(prev => ({
        ...prev,
        uploading: false,
        progress: finalProgress,
        completed,
        results: finalResults
      }))

      return { success: true, data: result.data }

    } catch (error) {
      setState(prev => ({
        ...prev,
        uploading: false,
        errors: {
          ...prev.errors,
          upload: error instanceof Error ? error.message : 'Upload failed'
        }
      }))

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }, [state.files, options])

  // Cancel upload
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setState(prev => ({ ...prev, uploading: false }))
  }, [])

  // Get upload progress for a file
  const getFileProgress = useCallback((filename: string, index: number) => {
    const fileKey = `${filename}_${index}`
    return state.progress[fileKey] || 0
  }, [state.progress])

  // Check if file is completed
  const isFileCompleted = useCallback((filename: string, index: number) => {
    const fileKey = `${filename}_${index}`
    return state.completed.includes(fileKey)
  }, [state.completed])

  // Get file error
  const getFileError = useCallback((filename: string, index: number) => {
    const fileKey = `${filename}_${index}`
    return state.errors[fileKey]
  }, [state.errors])

  // Get file result
  const getFileResult = useCallback((filename: string, index: number) => {
    const fileKey = `${filename}_${index}`
    return state.results[fileKey]
  }, [state.results])

  return {
    // State
    files: state.files,
    uploading: state.uploading,
    hasFiles: state.files.length > 0,
    hasErrors: Object.keys(state.errors).length > 0,
    
    // Actions
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    cancelUpload,
    
    // File-specific helpers
    getFileProgress,
    isFileCompleted,
    getFileError,
    getFileResult,
    
    // Summary
    totalFiles: state.files.length,
    completedCount: state.completed.length,
    errorCount: Object.keys(state.errors).length,
    overallProgress: state.files.length > 0 
      ? Math.round(state.completed.length / state.files.length * 100)
      : 0
  }
} 