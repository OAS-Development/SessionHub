import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  url: string
  format: string
  width: number
  height: number
  bytes: number
  resource_type: string
  created_at: string
  folder?: string
  tags?: string[]
}

export interface FileUploadOptions {
  folder?: string
  tags?: string[]
  transformation?: any
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  quality?: 'auto' | 'auto:good' | 'auto:best' | number
  overwrite?: boolean
  unique_filename?: boolean
  use_filename?: boolean
}

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'pad'
  quality?: 'auto' | 'auto:good' | 'auto:best' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  progressive?: boolean
  lazy?: boolean
}

// Enhanced Cloudinary client with optimization features
export class CloudinaryManager {
  // Upload file to Cloudinary
  async uploadFile(
    file: Buffer | string,
    options: FileUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      const uploadOptions = {
        folder: options.folder || 'development-hub',
        tags: options.tags || ['development-hub'],
        transformation: options.transformation,
        format: options.format || 'auto',
        quality: options.quality || 'auto:good',
        overwrite: options.overwrite || false,
        unique_filename: options.unique_filename !== false,
        use_filename: options.use_filename || true,
        // Auto-optimization settings
        fetch_format: 'auto',
        flags: 'progressive',
        // Security settings
        invalidate: true
      }

      // Handle Buffer uploads by converting to data URL
      let uploadFile: string
      if (Buffer.isBuffer(file)) {
        uploadFile = `data:image/jpeg;base64,${file.toString('base64')}`
      } else {
        uploadFile = file
      }

      const result = await cloudinary.uploader.upload(uploadFile, uploadOptions)
      
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        resource_type: result.resource_type,
        created_at: result.created_at,
        folder: result.folder,
        tags: result.tags
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Upload image with automatic optimization
  async uploadOptimizedImage(
    file: Buffer | string,
    options: FileUploadOptions & ImageOptimizationOptions = {}
  ): Promise<CloudinaryUploadResult> {
    const optimizationTransformation: any = {
      quality: options.quality || 'auto:good',
      fetch_format: 'auto',
      flags: 'progressive'
    }

    if (options.width || options.height) {
      optimizationTransformation.width = options.width
      optimizationTransformation.height = options.height
      optimizationTransformation.crop = options.crop || 'fill'
    }

    return this.uploadFile(file, {
      ...options,
      transformation: optimizationTransformation,
      format: 'auto'
    })
  }

  // Upload user avatar with specific optimizations
  async uploadAvatar(
    file: Buffer | string,
    userId: string,
    options: Partial<FileUploadOptions> = {}
  ): Promise<CloudinaryUploadResult> {
    return this.uploadOptimizedImage(file, {
      folder: `development-hub/avatars`,
      tags: ['avatar', 'user', userId],
      width: 200,
      height: 200,
      crop: 'fill',
      quality: 'auto:good',
      format: 'auto',
      overwrite: true,
      unique_filename: false,
      use_filename: false,
      ...options
    })
  }

  // Upload project file with organization
  async uploadProjectFile(
    file: Buffer | string,
    projectId: string,
    userId: string,
    options: Partial<FileUploadOptions> = {}
  ): Promise<CloudinaryUploadResult> {
    return this.uploadFile(file, {
      folder: `development-hub/projects/${projectId}`,
      tags: ['project', projectId, userId],
      quality: 'auto:good',
      ...options
    })
  }

  // Upload session screenshot
  async uploadSessionScreenshot(
    file: Buffer | string,
    sessionId: string,
    userId: string,
    options: Partial<FileUploadOptions> = {}
  ): Promise<CloudinaryUploadResult> {
    return this.uploadOptimizedImage(file, {
      folder: `development-hub/sessions/${sessionId}`,
      tags: ['screenshot', 'session', sessionId, userId],
      quality: 'auto:good',
      format: 'auto',
      ...options
    })
  }

  // Generate optimized image URL
  generateOptimizedUrl(
    publicId: string,
    options: ImageOptimizationOptions = {}
  ): string {
    const transformation: any = {
      quality: options.quality || 'auto:good',
      fetch_format: 'auto',
      flags: options.progressive ? 'progressive' : undefined,
      width: options.width,
      height: options.height,
      crop: options.crop || (options.width || options.height ? 'fill' : undefined)
    }

    // Remove undefined values
    Object.keys(transformation).forEach(key => 
      transformation[key] === undefined && delete transformation[key]
    )

    return cloudinary.url(publicId, { 
      transformation,
      secure: true
    })
  }

  // Generate responsive image URLs
  generateResponsiveUrls(
    publicId: string,
    breakpoints: number[] = [320, 640, 768, 1024, 1280]
  ): Array<{ width: number; url: string }> {
    return breakpoints.map(width => ({
      width,
      url: this.generateOptimizedUrl(publicId, { 
        width, 
        quality: 'auto:good',
        format: 'auto'
      })
    }))
  }

  // Delete file from Cloudinary
  async deleteFile(publicId: string): Promise<{ result: 'ok' | 'not found' }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      return { result: result.result }
    } catch (error) {
      console.error('Cloudinary delete error:', error)
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get file details
  async getFileDetails(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId)
      return result
    } catch (error) {
      console.error('Cloudinary details error:', error)
      throw new Error(`Failed to get file details: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // List files in folder
  async listFiles(
    folder: string,
    options: { 
      max_results?: number
      next_cursor?: string
      tags?: string[]
      prefix?: string
    } = {}
  ): Promise<{
    resources: Array<{
      public_id: string
      secure_url: string
      format: string
      width: number
      height: number
      bytes: number
      created_at: string
      tags: string[]
    }>
    next_cursor?: string
  }> {
    try {
      const searchOptions = {
        expression: `folder:${folder}${options.prefix ? ` AND public_id:${options.prefix}*` : ''}`,
        max_results: options.max_results || 50,
        next_cursor: options.next_cursor,
        sort_by: ['created_at', 'desc'] as [string, string],
        with_field: ['tags', 'context']
      }

      const result = await cloudinary.search
        .expression(searchOptions.expression)
        .max_results(searchOptions.max_results)
        .next_cursor(searchOptions.next_cursor || '')
        .sort_by('created_at', 'desc')
        .with_field(searchOptions.with_field[0])
        .with_field(searchOptions.with_field[1])
        .execute()

      return {
        resources: result.resources.map((resource: any) => ({
          public_id: resource.public_id,
          secure_url: resource.secure_url,
          format: resource.format,
          width: resource.width,
          height: resource.height,
          bytes: resource.bytes,
          created_at: resource.created_at,
          tags: resource.tags || []
        })),
        next_cursor: result.next_cursor
      }
    } catch (error) {
      console.error('Cloudinary list error:', error)
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Create signed upload URL for client-side uploads
  async createSignedUploadUrl(
    options: {
      folder?: string
      tags?: string[]
      timestamp?: number
      eager?: string
      transformation?: any
    } = {}
  ): Promise<{
    signature: string
    timestamp: number
    cloud_name: string
    api_key: string
    upload_url: string
  }> {
    const timestamp = options.timestamp || Math.round(Date.now() / 1000)
    
    const params = {
      timestamp,
      folder: options.folder || 'development-hub',
      tags: options.tags ? options.tags.join(',') : 'development-hub',
      eager: options.eager || 'c_fill,w_400,h_400,q_auto,f_auto',
      ...(options.transformation && { transformation: options.transformation })
    }

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!)

    return {
      signature,
      timestamp,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`
    }
  }
}

// Export singleton instance
export const cloudinaryManager = new CloudinaryManager()

// Utility functions
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return imageExtensions.includes(ext)
}

export function isDocumentFile(filename: string): boolean {
  const docExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf']
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return docExtensions.includes(ext)
}

export function getFileCategory(filename: string): 'image' | 'document' | 'other' {
  if (isImageFile(filename)) return 'image'
  if (isDocumentFile(filename)) return 'document'
  return 'other'
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Export Cloudinary instance for direct access
export { cloudinary } 