import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { s3FileManager } from "@/lib/aws/s3-upload";
import { validateAWSConfig } from "@/lib/aws/s3-config";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate AWS configuration
    const awsValidation = validateAWSConfig();
    if (!awsValidation.valid) {
      return NextResponse.json(
        { error: "AWS configuration invalid", details: awsValidation.errors },
        { status: 500 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "temp";
    const metadata = (formData.get("metadata") as string) || "{}";

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Validate folder
    const validFolders = ["videos", "thumbnails", "processed", "temp"];
    if (!validFolders.includes(folder)) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename
    const uniqueFilename = s3FileManager.generateUniqueFilename(
      file.name,
      userId
    );

    // Parse metadata
    let parsedMetadata;
    try {
      parsedMetadata = JSON.parse(metadata);
    } catch (error) {
      parsedMetadata = {};
    }

    // Add user metadata
    const userMetadata = {
      ...parsedMetadata,
      userId,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      fileSize: file.size.toString(),
    };

    // Upload file
    const result = await s3FileManager.uploadFile(buffer, {
      folder: folder as any,
      filename: uniqueFilename,
      contentType: file.type,
      metadata: userMetadata,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url,
      cdnUrl: result.cdnUrl,
      filename: uniqueFilename,
      size: file.size,
      contentType: file.type,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
