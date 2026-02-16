import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { SocialCreatePostPayload, SocialPlatform, SocialPost } from '@/types';
import { logger } from '@/app/utils/logger';
import { getSocialPosts, saveSocialPosts } from '@/app/utils/socialStore';

const VALID_PLATFORMS: SocialPlatform[] = ['linkedin', 'facebook', 'google_business', 'x'];

function isValidPlatforms(platforms: unknown): platforms is SocialPlatform[] {
  return Array.isArray(platforms) && platforms.length > 0 && platforms.every((platform) => VALID_PLATFORMS.includes(platform as SocialPlatform));
}

export async function GET(): Promise<NextResponse> {
  try {
    const posts = await getSocialPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    logger.error('Failed to load social posts', { error });
    return NextResponse.json({ error: 'Failed to load social posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SocialCreatePostPayload;

    if (!body.title || !body.content || !isValidPlatforms(body.platforms)) {
      return NextResponse.json(
        { error: 'title, content, and at least one platform are required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const post: SocialPost = {
      id: randomUUID(),
      title: body.title.trim(),
      content: body.content.trim(),
      linkUrl: body.linkUrl?.trim() || undefined,
      imageUrl: body.imageUrl?.trim() || undefined,
      mediaAssets: body.mediaAssets,
      objective: body.objective?.trim() || undefined,
      campaign: body.campaign?.trim() || undefined,
      cta: body.cta?.trim() || undefined,
      tags: body.tags,
      keywords: body.keywords,
      aiMetadata: body.aiMetadata,
      platforms: body.platforms,
      status: body.status || 'draft',
      scheduledAt: body.scheduledAt,
      createdAt: now,
      updatedAt: now
    };

    const posts = await getSocialPosts();
    posts.unshift(post);
    await saveSocialPosts(posts);

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create social post', { error });
    return NextResponse.json({ error: 'Failed to create social post' }, { status: 500 });
  }
}
