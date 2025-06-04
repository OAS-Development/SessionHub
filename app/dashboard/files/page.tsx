'use client'

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  CloudArrowUpIcon,
  FolderIcon,
  PhotoIcon,
  DocumentIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import FileUpload from '@/components/FileUpload'
import FileManager from '@/components/FileManager'
import { FileMetadata } from '@/lib/file-upload'

export default function FilesPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload')
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadComplete = (results: any[]) => {
    console.log('Upload completed:', results)
    // Switch to manage tab to see uploaded files
    setActiveTab('manage')
    setRefreshTrigger(prev => prev + 1)
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
    // Could show toast notification here
  }

  const handleFileSelect = (file: FileMetadata) => {
    setSelectedFile(file)
  }

  const handleFileDelete = (fileId: string) => {
    console.log('File deleted:', fileId)
    // Clear selection if deleted file was selected
    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile(null)
    }
  }

  const tabs = [
    {
      id: 'upload' as const,
      name: 'Upload Files',
      icon: CloudArrowUpIcon,
      description: 'Upload new files to your storage'
    },
    {
      id: 'manage' as const,
      name: 'Manage Files',
      icon: FolderIcon,
      description: 'Browse and organize your files'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg">
        <div className="px-6 py-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            File Storage 📁
          </h1>
          <p className="text-purple-100 text-lg">
            Upload, manage, and organize your project files with automatic optimization
          </p>
        </div>
      </div>

      {/* File Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PhotoIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Images</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DocumentIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ChartBarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Size</p>
              <p className="text-3xl font-bold text-gray-900">0 MB</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FolderIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-3xl font-bold text-gray-900">0%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Files</h3>
                <p className="text-gray-600 mb-6">
                  Drag and drop files or click to select. Images will be automatically optimized for web delivery.
                </p>
              </div>

              <FileUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                maxFiles={10}
                maxFileSize={10 * 1024 * 1024} // 10MB
                accept={[
                  'image/jpeg',
                  'image/jpg', 
                  'image/png',
                  'image/gif',
                  'image/webp',
                  'application/pdf',
                  'text/plain',
                  'text/markdown'
                ]}
                tags={['user-upload', user?.id || 'anonymous']}
                className="max-w-4xl"
              />

              {/* Upload Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Upload Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Images are automatically optimized for web (WebP/AVIF format)</li>
                  <li>• Maximum file size: 10MB per file</li>
                  <li>• Supported formats: JPG, PNG, GIF, WebP, PDF, TXT, MD</li>
                  <li>• Files are organized by upload date and can be tagged</li>
                  <li>• All uploads are cached for fast access</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">File Manager</h3>
                <p className="text-gray-600 mb-6">
                  Browse, search, and manage your uploaded files. Click on any file to view details.
                </p>
              </div>

              <FileManager
                userId={user?.id}
                onFileSelect={handleFileSelect}
                onFileDelete={handleFileDelete}
                maxFiles={100}
                className="min-h-96"
                key={refreshTrigger} // Force refresh when files are uploaded
              />
            </div>
          )}
        </div>
      </div>

      {/* File Details Sidebar */}
      {selectedFile && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">File Details</h3>
          
          <div className="space-y-4">
            {/* File Preview */}
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {selectedFile.category === 'image' ? (
                <img
                  src={selectedFile.cloudinary.secure_url}
                  alt={selectedFile.filename}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">{selectedFile.filename}</p>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">Filename</p>
                <p className="text-gray-600 truncate">{selectedFile.filename}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Size</p>
                <p className="text-gray-600">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Format</p>
                <p className="text-gray-600 uppercase">{selectedFile.cloudinary.format}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Uploaded</p>
                <p className="text-gray-600">
                  {new Date(selectedFile.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              {selectedFile.category === 'image' && selectedFile.cloudinary.width && (
                <>
                  <div>
                    <p className="font-medium text-gray-900">Dimensions</p>
                    <p className="text-gray-600">
                      {selectedFile.cloudinary.width} × {selectedFile.cloudinary.height}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Tags */}
            {selectedFile.tags.length > 0 && (
              <div>
                <p className="font-medium text-gray-900 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFile.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {selectedFile.description && (
              <div>
                <p className="font-medium text-gray-900 mb-2">Description</p>
                <p className="text-gray-600 text-sm">{selectedFile.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <a
                href={selectedFile.cloudinary.secure_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Full Size
              </a>
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ File Storage Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CloudArrowUpIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Auto Optimization</h4>
              <p className="text-sm text-gray-600">Images automatically converted to WebP/AVIF for faster loading</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Performance Tracking</h4>
              <p className="text-sm text-gray-600">File operations tracked for learning system optimization</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FolderIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Smart Organization</h4>
              <p className="text-sm text-gray-600">Files organized by project, session, and custom tags</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 