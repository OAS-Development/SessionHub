import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { fileUploadManager, generateUploadId, FileValidationResult } from '@/lib/file-upload'

export const runtime = 'nodejs'

interface UploadRequestBody {
  files: Array<{
    filename: string
    content: string // base64 encoded
    type: string
    size: number
  }>
  options?: {
    projectId?: string
    sessionId?: string
    folder?: string
    tags?: string[]
    description?: string
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check authentication
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Parse request body
    const body: UploadRequestBody = await request.json()
    
    if (!body.files || !Array.isArray(body.files) || body.files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      }, { status: 400 })
    }

    // Validate files
    const files = body.files.map(fileData => {
      // Create a proper File-like object for validation
      const blob = new Blob([Buffer.from(fileData.content, 'base64')], { type: fileData.type })
      const file = new File([blob], fileData.filename, {
        type: fileData.type,
        lastModified: Date.now()
      })
      
      // Add size property for validation
      Object.defineProperty(file, 'size', {
        value: fileData.size,
        writable: false
      })
      
      return file
    })

    const validation = fileUploadManager.validateFiles(files)
    
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'File validation failed',
        details: {
          globalErrors: validation.globalErrors,
          fileErrors: validation.results.map((result, index) => ({
            filename: body.files[index].filename,
            errors: result.errors,
            warnings: result.warnings
          }))
        }
      }, { status: 400 })
    }

    // Process uploads
    const uploadResults = []
    const uploadErrors = []

    for (let i = 0; i < body.files.length; i++) {
      const fileData = body.files[i]
      const uploadId = generateUploadId()

      try {
        // Create upload progress tracking
        await fileUploadManager.createUploadProgress(
          uploadId,
          fileData.filename,
          fileData.size
        )

        // Convert base64 to buffer
        const fileBuffer = Buffer.from(fileData.content, 'base64')

        // Upload file
        const result = await fileUploadManager.uploadFile(
          fileBuffer,
          fileData.filename,
          userId,
          {
            uploadId,
            projectId: body.options?.projectId,
            sessionId: body.options?.sessionId,
            folder: body.options?.folder,
            tags: body.options?.tags,
            description: body.options?.description
          }
        )

        uploadResults.push({
          filename: fileData.filename,
          uploadId,
          success: true,
          result: {
            id: result.public_id,
            url: result.secure_url,
            format: result.format,
            size: result.bytes,
            width: result.width,
            height: result.height
          }
        })

        // Track successful operation
        await fileUploadManager.trackFileOperation(
          userId,
          'upload',
          { 
            category: validation.results[i].fileInfo.category,
            size: fileData.size
          },
          true,
          Date.now() - startTime
        )

      } catch (error) {
        console.error(`Upload failed for ${fileData.filename}:`, error)
        
        uploadErrors.push({
          filename: fileData.filename,
          uploadId,
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed'
        })

        // Track failed operation
        await fileUploadManager.trackFileOperation(
          userId,
          'upload',
          { 
            category: validation.results[i].fileInfo.category,
            size: fileData.size
          },
          false,
          Date.now() - startTime
        )
      }
    }

    const responseTime = Date.now() - startTime
    const successRate = uploadResults.length / body.files.length

    return NextResponse.json({
      success: uploadErrors.length === 0,
      data: {
        uploads: uploadResults,
        errors: uploadErrors,
        summary: {
          totalFiles: body.files.length,
          successful: uploadResults.length,
          failed: uploadErrors.length,
          successRate: Math.round(successRate * 100)
        },
        _performance: {
          responseTime,
          cached: false,
          filesProcessed: body.files.length
        }
      }
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`Upload API error after ${responseTime}ms:`, error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Upload processing failed',
        _performance: {
          responseTime,
          cached: false,
          error: true
        }
      }, 
      { status: 500 }
    )
  }
}

// Get upload progress
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get('uploadId')

    if (!uploadId) {
      return NextResponse.json({
        success: false,
        error: 'Upload ID required'
      }, { status: 400 })
    }

    const progress = await fileUploadManager.getUploadProgress(uploadId)

    if (!progress) {
      return NextResponse.json({
        success: false,
        error: 'Upload progress not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: progress
    })
  } catch (error) {
    console.error('Upload progress error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get upload progress' 
      }, 
      { status: 500 }
    )
  }
} 