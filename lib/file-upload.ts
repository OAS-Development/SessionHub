import { cloudinaryManager, isImageFile, isDocumentFile, getFileCategory, formatFileSize, CloudinaryUploadResult } from './cloudinary'
import { enhancedRedis, CacheKeys } from './redis'
import { CacheTTL } from './cache'

export interface FileValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  fileInfo: {
    name: string
    size: number
    type: string
    category: 'image' | 'document' | 'other'
    extension: string
  }
}

export interface UploadProgress {
  id: string
  filename: string
  progress: number
  status: 'preparing' | 'uploading' | 'processing' | 'completed' | 'error'
  uploadedBytes: number
  totalBytes: number
  error?: string
  result?: CloudinaryUploadResult
}

export interface FileMetadata {
  id: string
  filename: string
  originalName: string
  size: number
  type: string
  category: 'image' | 'document' | 'other'
  cloudinary: CloudinaryUploadResult
  userId: string
  projectId?: string
  sessionId?: string
  uploadedAt: Date
  lastAccessed: Date
  tags: string[]
  description?: string
}

// File validation configuration
export const FILE_VALIDATION_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxImageSize: 5 * 1024 * 1024,  // 5MB for images
  maxDocumentSize: 10 * 1024 * 1024, // 10MB for documents
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  allowedDocumentTypes: ['application/pdf', 'text/plain', 'text/markdown', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.txt', '.md', '.doc', '.docx'],
  maxFilesPerUpload: 10,
  minImageDimensions: { width: 10, height: 10 },
  maxImageDimensions: { width: 8000, height: 8000 }
}

// Enhanced file upload manager with Redis integration
export class FileUploadManager {
  private redis = enhancedRedis

  // Validate file before upload
  validateFile(file: File): FileValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      category: getFileCategory(file.name),
      extension: file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    }

    // Check file size
    if (file.size === 0) {
      errors.push('File is empty')
    } else if (file.size > FILE_VALIDATION_CONFIG.maxFileSize) {
      errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum allowed (${formatFileSize(FILE_VALIDATION_CONFIG.maxFileSize)})`)
    }

    // Category-specific validation
    if (fileInfo.category === 'image') {
      if (file.size > FILE_VALIDATION_CONFIG.maxImageSize) {
        errors.push(`Image size (${formatFileSize(file.size)}) exceeds maximum for images (${formatFileSize(FILE_VALIDATION_CONFIG.maxImageSize)})`)
      }
      if (!FILE_VALIDATION_CONFIG.allowedImageTypes.includes(file.type)) {
        errors.push(`Image type "${file.type}" is not allowed`)
      }
    } else if (fileInfo.category === 'document') {
      if (file.size > FILE_VALIDATION_CONFIG.maxDocumentSize) {
        errors.push(`Document size (${formatFileSize(file.size)}) exceeds maximum for documents (${formatFileSize(FILE_VALIDATION_CONFIG.maxDocumentSize)})`)
      }
      if (!FILE_VALIDATION_CONFIG.allowedDocumentTypes.includes(file.type)) {
        errors.push(`Document type "${file.type}" is not allowed`)
      }
    }

    // Check file extension
    if (!FILE_VALIDATION_CONFIG.allowedExtensions.includes(fileInfo.extension)) {
      errors.push(`File extension "${fileInfo.extension}" is not allowed`)
    }

    // Warnings for large files
    if (file.size > 2 * 1024 * 1024) { // 2MB
      warnings.push(`Large file size (${formatFileSize(file.size)}) may take longer to upload`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      fileInfo
    }
  }

  // Validate multiple files
  validateFiles(files: File[]): { 
    valid: boolean
    results: FileValidationResult[]
    globalErrors: string[]
  } {
    const globalErrors: string[] = []
    
    if (files.length === 0) {
      globalErrors.push('No files selected')
    } else if (files.length > FILE_VALIDATION_CONFIG.maxFilesPerUpload) {
      globalErrors.push(`Too many files selected (${files.length}). Maximum allowed: ${FILE_VALIDATION_CONFIG.maxFilesPerUpload}`)
    }

    const results = files.map(file => this.validateFile(file))
    const allValid = results.every(result => result.valid) && globalErrors.length === 0

    return {
      valid: allValid,
      results,
      globalErrors
    }
  }

  // Create upload progress tracking
  async createUploadProgress(
    uploadId: string,
    filename: string,
    totalBytes: number
  ): Promise<void> {
    const progress: UploadProgress = {
      id: uploadId,
      filename,
      progress: 0,
      status: 'preparing',
      uploadedBytes: 0,
      totalBytes
    }

    await this.redis.set(
      `upload_progress:${uploadId}`,
      progress,
      { ex: 3600 } // 1 hour TTL
    )
  }

  // Update upload progress
  async updateUploadProgress(
    uploadId: string,
    updates: Partial<UploadProgress>
  ): Promise<void> {
    const existing = await this.redis.get<UploadProgress>(`upload_progress:${uploadId}`)
    
    if (existing) {
      const updated = { ...existing, ...updates }
      await this.redis.set(
        `upload_progress:${uploadId}`,
        updated,
        { ex: 3600 }
      )
    }
  }

  // Get upload progress
  async getUploadProgress(uploadId: string): Promise<UploadProgress | null> {
    return await this.redis.get<UploadProgress>(`upload_progress:${uploadId}`)
  }

  // Upload file with progress tracking
  async uploadFile(
    file: Buffer,
    filename: string,
    userId: string,
    options: {
      uploadId: string
      projectId?: string
      sessionId?: string
      folder?: string
      tags?: string[]
      description?: string
    }
  ): Promise<CloudinaryUploadResult> {
    const { uploadId, projectId, sessionId } = options

    try {
      // Update progress to uploading
      await this.updateUploadProgress(uploadId, {
        status: 'uploading',
        progress: 10
      })

      // Determine upload strategy based on context
      let result: CloudinaryUploadResult

      if (options.folder === 'avatars') {
        result = await cloudinaryManager.uploadAvatar(file, userId, {
          tags: options.tags,
          overwrite: true
        })
      } else if (projectId) {
        result = await cloudinaryManager.uploadProjectFile(file, projectId, userId, {
          tags: options.tags
        })
      } else if (sessionId) {
        result = await cloudinaryManager.uploadSessionScreenshot(file, sessionId, userId, {
          tags: options.tags
        })
      } else {
        result = await cloudinaryManager.uploadFile(file, {
          folder: options.folder || `sessionhub/users/${userId}`,
          tags: options.tags || ['user-upload', userId]
        })
      }

      // Update progress to processing
      await this.updateUploadProgress(uploadId, {
        status: 'processing',
        progress: 70
      })

      // Cache file metadata
      const metadata: FileMetadata = {
        id: result.public_id,
        filename: filename,
        originalName: filename,
        size: result.bytes,
        type: `image/${result.format}`,
        category: getFileCategory(filename),
        cloudinary: result,
        userId,
        projectId,
        sessionId,
        uploadedAt: new Date(),
        lastAccessed: new Date(),
        tags: result.tags || [],
        description: options.description
      }

      await this.cacheFileMetadata(metadata)

      // Update progress to completed
      await this.updateUploadProgress(uploadId, {
        status: 'completed',
        progress: 100,
        result
      })

      return result
    } catch (error) {
      console.error('File upload error:', error)
      
      await this.updateUploadProgress(uploadId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      })

      throw error
    }
  }

  // Cache file metadata for quick access
  async cacheFileMetadata(metadata: FileMetadata): Promise<void> {
    const cacheKey = `file_metadata:${metadata.id}`
    await this.redis.set(cacheKey, metadata, { ex: CacheTTL.LONG_TERM })

    // Add to user's file list cache
    const userFilesKey = `user_files:${metadata.userId}`
    const userFiles = await this.redis.get<string[]>(userFilesKey) || []
    
    if (!userFiles.includes(metadata.id)) {
      userFiles.unshift(metadata.id) // Add to beginning
      // Keep only last 1000 files
      const trimmedFiles = userFiles.slice(0, 1000)
      await this.redis.set(userFilesKey, trimmedFiles, { ex: CacheTTL.LONG_TERM })
    }
  }

  // Get cached file metadata
  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    return await this.redis.get<FileMetadata>(`file_metadata:${fileId}`)
  }

  // Get user's files with caching
  async getUserFiles(
    userId: string,
    options: {
      category?: 'image' | 'document' | 'other'
      projectId?: string
      limit?: number
      offset?: number
    } = {}
  ): Promise<FileMetadata[]> {
    const cacheKey = `user_files_list:${userId}:${JSON.stringify(options)}`
    
    // Try cache first
    const cached = await this.redis.get<FileMetadata[]>(cacheKey)
    if (cached) {
      return cached
    }

    // Get file IDs from user's file list
    const userFilesKey = `user_files:${userId}`
    const fileIds = await this.redis.get<string[]>(userFilesKey) || []

    // Get metadata for each file
    const files: FileMetadata[] = []
    const metadataPromises = fileIds.map(id => this.getFileMetadata(id))
    const metadataResults = await Promise.all(metadataPromises)

    for (const metadata of metadataResults) {
      if (metadata) {
        // Apply filters
        if (options.category && metadata.category !== options.category) continue
        if (options.projectId && metadata.projectId !== options.projectId) continue
        
        files.push(metadata)
      }
    }

    // Apply pagination
    const start = options.offset || 0
    const end = start + (options.limit || 50)
    const paginatedFiles = files.slice(start, end)

    // Cache results
    await this.redis.set(cacheKey, paginatedFiles, { ex: CacheTTL.USER_DATA })

    return paginatedFiles
  }

  // Delete file and clear cache
  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      // Get file metadata
      const metadata = await this.getFileMetadata(fileId)
      if (!metadata || metadata.userId !== userId) {
        throw new Error('File not found or access denied')
      }

      // Delete from Cloudinary
      await cloudinaryManager.deleteFile(fileId)

      // Remove from cache
      await this.redis.del(`file_metadata:${fileId}`)

      // Remove from user's file list
      const userFilesKey = `user_files:${userId}`
      const userFiles = await this.redis.get<string[]>(userFilesKey) || []
      const updatedFiles = userFiles.filter(id => id !== fileId)
      await this.redis.set(userFilesKey, updatedFiles, { ex: CacheTTL.LONG_TERM })

      // Clear user files cache
      await this.clearUserFilesCache(userId)

      return true
    } catch (error) {
      console.error('File deletion error:', error)
      return false
    }
  }

  // Clear user files cache
  async clearUserFilesCache(userId: string): Promise<void> {
    // This would ideally use Redis SCAN to find all cache keys
    // For now, we'll clear common cache patterns
    const patterns = [
      `user_files_list:${userId}:*`
    ]

    // In a real implementation, you'd use Redis SCAN
    console.log(`Clearing cache patterns for user ${userId}:`, patterns)
  }

  // Track file operation patterns for learning system
  async trackFileOperation(
    userId: string,
    operation: 'upload' | 'delete' | 'view' | 'download',
    fileMetadata: Partial<FileMetadata>,
    success: boolean,
    duration: number
  ): Promise<void> {
    const operationData = {
      userId,
      operation,
      fileCategory: fileMetadata.category,
      fileSize: fileMetadata.size,
      success,
      duration,
      timestamp: new Date().toISOString()
    }

    // Store in Redis for learning system to pick up
    const operationKey = `file_operation:${Date.now()}:${userId}`
    await this.redis.set(operationKey, operationData, { ex: 86400 }) // 24 hours

    console.log('File operation tracked:', operationData)
  }
}

// Export singleton instance
export const fileUploadManager = new FileUploadManager()

// Utility functions
export function generateUploadId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  
  return mimeTypes[ext] || 'application/octet-stream'
} 