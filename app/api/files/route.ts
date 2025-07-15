import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { s3FileManager } from '@/lib/aws/s3-upload';
import { validateAWSConfig } from '@/lib/aws/s3-config';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'temp';
    const key = searchParams.get('key');

    // Validate folder
    const validFolders = ['videos', 'thumbnails', 'processed', 'temp'];
    if (!validFolders.includes(folder)) {
      return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
    }

    // If key is provided, get specific file info
    if (key) {
      const fileInfo = await s3FileManager.getFileInfo(key);
      if (!fileInfo) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      // Check if user owns the file
      if (fileInfo.metadata?.userId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      return NextResponse.json(fileInfo);
    }

    // List files in folder
    const files = await s3FileManager.listFiles(folder as any);
    
    // Filter files by user ID
    const userFiles = files.filter(file => {
      // For listing, we can only filter by filename prefix since metadata isn't available
      // Files are prefixed with userId during upload
      return file.key.includes(`/${userId}-`);
    });

    return NextResponse.json({ files: userFiles });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const { key, keys } = body;

    if (!key && !keys) {
      return NextResponse.json({ error: 'Key or keys are required' }, { status: 400 });
    }

    // Handle single file deletion
    if (key) {
      // Check if user owns the file
      const fileInfo = await s3FileManager.getFileInfo(key);
      if (!fileInfo) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      if (fileInfo.metadata?.userId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const success = await s3FileManager.deleteFile(key);
      if (!success) {
        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
      }

      return NextResponse.json({ success: true, deletedKey: key });
    }

    // Handle multiple file deletion
    if (keys && Array.isArray(keys)) {
      // Verify ownership of all files
      const fileChecks = await Promise.all(
        keys.map(async (fileKey: string) => {
          const fileInfo = await s3FileManager.getFileInfo(fileKey);
          return {
            key: fileKey,
            exists: !!fileInfo,
            owned: fileInfo?.metadata?.userId === userId,
          };
        })
      );

      const unauthorizedFiles = fileChecks.filter(check => !check.owned);
      if (unauthorizedFiles.length > 0) {
        return NextResponse.json(
          { error: 'Unauthorized access to some files' },
          { status: 403 }
        );
      }

      const existingKeys = fileChecks.filter(check => check.exists).map(check => check.key);
      const result = await s3FileManager.deleteFiles(existingKeys);

      return NextResponse.json({
        success: result.success,
        deletedKeys: result.deletedKeys,
        errors: result.errors,
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}