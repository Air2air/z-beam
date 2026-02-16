import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { SocialUploadResponse } from '@/types';
import { logger } from '@/app/utils/logger';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function sanitizeFileName(fileName: string): string {
  return fileName.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and WEBP images are supported' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image exceeds 10MB size limit' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'images', 'social');
    await mkdir(uploadsDir, { recursive: true });

    const extension = path.extname(file.name) || '.jpg';
    const baseName = sanitizeFileName(path.basename(file.name, extension));
    const finalName = `${baseName}-${randomUUID()}${extension}`;
    const diskPath = path.join(uploadsDir, finalName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(diskPath, buffer);

    const response: SocialUploadResponse = {
      url: `/images/social/${finalName}`
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('Failed to upload social image', { error });
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
