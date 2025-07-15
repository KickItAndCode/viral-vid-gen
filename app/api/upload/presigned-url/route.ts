import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { s3FileManager } from '@/lib/aws/s3-upload';
import { validateAWSConfig } from '@/lib/aws/s3-config';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate AWS configuration
    const awsValidation = validateAWSConfig();
    if (!awsValidation.valid) {
      return NextResponse.json(
        { error: 'AWS configuration invalid', details: awsValidation.errors },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { filename, contentType, folder = 'temp', metadata = {} } = body;

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Validate folder
    const validFolders = ['videos', 'thumbnails', 'processed', 'temp'];
    if (!validFolders.includes(folder)) {
      return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
    }

    // Generate unique filename with user ID prefix
    const uniqueFilename = s3FileManager.generateUniqueFilename(filename, userId);

    // Add user metadata
    const userMetadata = {
      ...metadata,
      userId,
      originalName: filename,
      uploadedAt: new Date().toISOString(),
    };

    // Generate presigned URL
    const result = await s3FileManager.getPresignedUploadUrl({
      folder: folder as any,
      filename: uniqueFilename,
      contentType,
      metadata: userMetadata,
      expiresInSeconds: 3600, // 1 hour
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      key: result.key,
      cdnUrl: result.cdnUrl,
      filename: uniqueFilename,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600');

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    // Generate presigned download URL
    const downloadUrl = await s3FileManager.getPresignedDownloadUrl(key, expiresIn);

    if (!downloadUrl) {
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }

    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error('Error generating presigned download URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}