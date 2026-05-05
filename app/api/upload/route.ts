import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getCurrentAdmin } from '@/lib/actions/admin-auth'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// Bucket configuration for different upload types
const BUCKET_CONFIG: Record<string, string> = {
  testimonials: 'testimonials',
  'support-screenshots': 'support-screenshots',
  media: 'media',
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'media'
    const oldFilePath = formData.get('oldFilePath') as string | null
    const customName = formData.get('customName') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB.' },
        { status: 400 }
      )
    }

    // Get bucket name
    const bucketName = BUCKET_CONFIG[folder] || 'media'

    // Generate unique filename
    const timestamp = new Date().toISOString()
      .replace(/T/, '_')
      .replace(/\..+/, '')
      .replace(/:/g, '-')
    
    const randomId = Math.random().toString(36).substring(2, 10)
    const fileExtension = file.name.split('.').pop() || 'jpg'
    
    // Use custom name if provided, otherwise use original filename
    const baseName = customName || file.name.replace(/\.[^/.]+$/, '')
    const sanitizedName = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 30)
    
    // Format: {name}_{date}_{random-id}.{ext}
    // Example: john-doe_2026-06-01_14-30-45_a3f9b2c1.jpg
    const fileName = `${sanitizedName}_${timestamp}_${randomId}.${fileExtension}`
    const filePath = `${folder}/${fileName}`

    // Upload to Supabase Storage
    const supabase = createServiceRoleClient()
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '31536000', // 1 year
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file. Please try again.' },
        { status: 500 }
      )
    }

    // Delete old file if provided (non-blocking, don't fail upload if deletion fails)
    if (oldFilePath) {
      try {
        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove([oldFilePath])
        
        if (deleteError) {
          console.warn('Failed to delete old file:', oldFilePath, deleteError)
          // Don't fail the request, just log the warning
        }
      } catch (deleteErr) {
        console.warn('Error during old file deletion:', deleteErr)
        // Continue anyway
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      bucket: bucketName,
      oldFileDeleted: !!oldFilePath,
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      )
    }

    // Only delete files from our storage (safety check)
    if (!imageUrl.includes('/storage/v1/object/public/')) {
      return NextResponse.json(
        { error: 'Can only delete files from storage' },
        { status: 400 }
      )
    }

    // Extract bucket and file path from URL
    const urlMatch = imageUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
    if (!urlMatch) {
      return NextResponse.json(
        { error: 'Invalid storage URL format' },
        { status: 400 }
      )
    }

    const [, bucketName, filePath] = urlMatch

    // Delete from storage
    const supabase = createServiceRoleClient()
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([filePath])

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })

  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
