import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { fileUploadManager } from '@/lib/file-upload'
import { withCacheTracking } from '@/lib/middleware/cache'

async function filesHandler(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const method = request.method

    if (method === 'GET') {
      // Get user's files
      const category = searchParams.get('category') as 'image' | 'document' | 'other' | null
      const projectId = searchParams.get('projectId')
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')

      const files = await fileUploadManager.getUserFiles(userId, {
        category: category || undefined,
        projectId: projectId || undefined,
        limit,
        offset
      })

      const responseTime = Date.now() - startTime

      return NextResponse.json({
        success: true,
        data: {
          files,
          pagination: {
            limit,
            offset,
            total: files.length,
            hasMore: files.length === limit
          },
          _performance: {
            responseTime,
            cached: true, // Files are cached in fileUploadManager
            filesReturned: files.length
          }
        }
      })
    }

    if (method === 'DELETE') {
      // Delete file
      const fileId = searchParams.get('fileId')
      
      if (!fileId) {
        return NextResponse.json({
          success: false,
          error: 'File ID required'
        }, { status: 400 })
      }

      const deleted = await fileUploadManager.deleteFile(fileId, userId)
      
      if (!deleted) {
        return NextResponse.json({
          success: false,
          error: 'Failed to delete file or file not found'
        }, { status: 404 })
      }

      // Track delete operation
      await fileUploadManager.trackFileOperation(
        userId,
        'delete',
        { id: fileId },
        true,
        Date.now() - startTime
      )

      const responseTime = Date.now() - startTime

      return NextResponse.json({
        success: true,
        data: {
          fileId,
          deleted: true,
          _performance: {
            responseTime,
            cached: false
          }
        }
      })
    }

    if (method === 'PUT') {
      // Update file metadata
      const fileId = searchParams.get('fileId')
      
      if (!fileId) {
        return NextResponse.json({
          success: false,
          error: 'File ID required'
        }, { status: 400 })
      }

      const body = await request.json()
      const { description, tags } = body

      // Get current file metadata
      const currentMetadata = await fileUploadManager.getFileMetadata(fileId)
      
      if (!currentMetadata || currentMetadata.userId !== userId) {
        return NextResponse.json({
          success: false,
          error: 'File not found or access denied'
        }, { status: 404 })
      }

      // Update metadata
      const updatedMetadata = {
        ...currentMetadata,
        description: description !== undefined ? description : currentMetadata.description,
        tags: tags !== undefined ? tags : currentMetadata.tags,
        lastAccessed: new Date()
      }

      await fileUploadManager.cacheFileMetadata(updatedMetadata)

      const responseTime = Date.now() - startTime

      return NextResponse.json({
        success: true,
        data: {
          file: updatedMetadata,
          _performance: {
            responseTime,
            cached: false,
            updated: true
          }
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Method not allowed'
    }, { status: 405 })

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`Files API error after ${responseTime}ms:`, error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'File operation failed',
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

// Apply tracking middleware
export const GET = withCacheTracking(filesHandler)
export const DELETE = withCacheTracking(filesHandler)
export const PUT = withCacheTracking(filesHandler) 