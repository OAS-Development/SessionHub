'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  PhotoIcon,
  DocumentIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline'
import { FileMetadata } from '@/lib/file-upload'

export interface FileManagerProps {
  userId?: string
  projectId?: string
  className?: string
  onFileSelect?: (file: FileMetadata) => void
  onFileDelete?: (fileId: string) => void
  maxFiles?: number
}

interface FileFilter {
  category: 'all' | 'image' | 'document' | 'other'
  search: string
  sortBy: 'name' | 'size' | 'date'
  sortOrder: 'asc' | 'desc'
}

export default function FileManager({
  userId,
  projectId,
  className = '',
  onFileSelect,
  onFileDelete,
  maxFiles = 50
}: FileManagerProps) {
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<FileFilter>({
    category: 'all',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc'
  })

  // Fetch files
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: maxFiles.toString(),
        offset: '0'
      })

      if (filter.category !== 'all') {
        params.append('category', filter.category)
      }

      if (projectId) {
        params.append('projectId', projectId)
      }

      const response = await fetch(`/api/files?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setFiles(result.data.files)
      } else {
        throw new Error(result.error || 'Failed to fetch files')
      }
    } catch (err) {
      console.error('File fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch files')
    } finally {
      setLoading(false)
    }
  }, [maxFiles, filter.category, projectId])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // Filter and sort files
  const filteredFiles = React.useMemo(() => {
    let filtered = files

    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      filtered = filtered.filter(file => 
        file.filename.toLowerCase().includes(searchLower) ||
        file.description?.toLowerCase().includes(searchLower) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (filter.sortBy) {
        case 'name':
          comparison = a.filename.localeCompare(b.filename)
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          break
      }

      return filter.sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [files, filter])

  // Delete file
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/files?fileId=${fileId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete file')
      }

      const result = await response.json()
      
      if (result.success) {
        setFiles(prev => prev.filter(f => f.id !== fileId))
        setSelectedFiles(prev => {
          const newSet = new Set(prev)
          newSet.delete(fileId)
          return newSet
        })
        onFileDelete?.(fileId)
      } else {
        throw new Error(result.error || 'Failed to delete file')
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete file')
    }
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedFiles.size} file(s)?`)) return

    const deletePromises = Array.from(selectedFiles).map(async (fileId) => {
      try {
        const response = await fetch(`/api/files?fileId=${fileId}`, {
          method: 'DELETE'
        })
        return { fileId, success: response.ok }
      } catch {
        return { fileId, success: false }
      }
    })

    const results = await Promise.all(deletePromises)
    const successfulDeletes = results.filter(r => r.success).map(r => r.fileId)

    setFiles(prev => prev.filter(f => !successfulDeletes.includes(f.id)))
    setSelectedFiles(new Set())

    successfulDeletes.forEach(fileId => onFileDelete?.(fileId))
  }

  // Toggle file selection
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  // Select all files
  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)))
    }
  }

  // Get file icon
  const getFileIcon = (file: FileMetadata) => {
    if (file.category === 'image') {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />
    }
    return <DocumentIcon className="h-8 w-8 text-gray-500" />
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format date
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className={`${className} p-6`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className} p-6`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchFiles}
            className="mt-2 text-red-600 hover:text-red-800 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Header and Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">File Manager</h2>
          <div className="flex items-center gap-2">
            {selectedFiles.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
                Delete ({selectedFiles.size})
              </button>
            )}
            <button
              onClick={fetchFiles}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filter.category}
            onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value as any }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Files</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
            <option value="other">Other</option>
          </select>

          {/* Sort */}
          <select
            value={`${filter.sortBy}-${filter.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-')
              setFilter(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }))
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {filteredFiles.length} of {files.length} files
            {filter.search && ` matching "${filter.search}"`}
          </span>
          {filteredFiles.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFiles.size === filteredFiles.length}
                onChange={toggleSelectAll}
                className="rounded border-gray-300"
              />
              Select all
            </label>
          )}
        </div>
      </div>

      {/* File Grid */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No files found</h3>
          <p className="mt-2 text-gray-500">
            {filter.search || filter.category !== 'all'
              ? 'Try adjusting your filters'
              : 'Upload some files to get started'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`
                border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer
                ${selectedFiles.has(file.id) 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white'
                }
              `}
              onClick={() => onFileSelect?.(file)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      toggleFileSelection(file.id)
                    }}
                    className="mr-3 rounded border-gray-300"
                  />
                  {getFileIcon(file)}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(file.cloudinary.secure_url, '_blank')
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View file"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFile(file.id)
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete file"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 truncate" title={file.filename}>
                  {file.filename}
                </h3>
                
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>{formatFileSize(file.size)}</span>
                  <span className="capitalize">{file.cloudinary.format}</span>
                  {file.category === 'image' && file.cloudinary.width && (
                    <span>{file.cloudinary.width} × {file.cloudinary.height}</span>
                  )}
                </div>

                <div className="flex items-center text-xs text-gray-400">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {formatDate(file.uploadedAt)}
                </div>

                {file.description && (
                  <p className="text-sm text-gray-600 truncate" title={file.description}>
                    {file.description}
                  </p>
                )}

                {file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {file.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {file.tags.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{file.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 