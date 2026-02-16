import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import type { SocialMediaAsset, SocialMediaUploadResponse } from '@/types';
import { logger } from '@/app/utils/logger';

const MAX_FILE_SIZE_BYTES = 150 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm'
]);

function sanitizeFileName(fileName: string): string {
  return fileName.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
}

function getAssetType(mimeType: string): 'image' | 'video' {
  return mimeType.startsWith('video/') ? 'video' : 'image';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files').filter((item): item is File => item instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: 'At least one media file is required' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'images', 'social');
    await mkdir(uploadsDir, { recursive: true });

    const assets: SocialMediaAsset[] = [];

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.type}` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `${file.name} exceeds 150MB size limit` },
          { status: 400 }
        );
      }

      const extension = path.extname(file.name) || (file.type.startsWith('video/') ? '.mp4' : '.jpg');
      const baseName = sanitizeFileName(path.basename(file.name, extension));
      const id = randomUUID();
      const finalName = `${baseName}-${id}${extension}`;
      const diskPath = path.join(uploadsDir, finalName);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(diskPath, buffer);

      assets.push({
        id,
        type: getAssetType(file.type),
        url: `/images/social/${finalName}`,
        mimeType: file.type,
        fileName: file.name
      });
    }

    const response: SocialMediaUploadResponse = { assets };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('Failed to upload social media assets', { error });
    return NextResponse.json({ error: 'Failed to upload media assets' }, { status: 500 });
  }
}
