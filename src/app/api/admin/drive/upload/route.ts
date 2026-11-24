import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadImageToDrive, deleteFileFromDrive } from '@/lib/google-drive';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as string) || 'astrology-bracelets';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadImageToDrive(buffer, file.name, file.type, category);

    if (!uploadResult) {
      return NextResponse.json({ error: 'Failed to upload to Google Drive' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      fileId: uploadResult.fileId,
      url: uploadResult.viewLink,
      thumbnail: uploadResult.thumbnailLink,
      name: uploadResult.name,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { fileId } = await req.json();
    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
    }
    const deleted = await deleteFileFromDrive(fileId);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
