import { NextRequest, NextResponse } from 'next/server';
import { SocialPlatform, SocialUpdatePostPayload } from '@/types';
import { logger } from '@/app/utils/logger';
import { getSocialPosts, saveSocialPosts } from '@/app/utils/socialStore';

const VALID_PLATFORMS: SocialPlatform[] = ['linkedin', 'facebook', 'google_business', 'x'];

function isValidPlatforms(platforms: unknown): platforms is SocialPlatform[] {
  return Array.isArray(platforms) && platforms.length > 0 && platforms.every((platform) => VALID_PLATFORMS.includes(platform as SocialPlatform));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SocialUpdatePostPayload;
    const posts = await getSocialPosts();
    const index = posts.findIndex((post) => post.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (body.platforms && !isValidPlatforms(body.platforms)) {
      return NextResponse.json(
        { error: 'At least one valid platform is required' },
        { status: 400 }
      );
    }

    const current = posts[index];
    const updated = {
      ...current,
      ...body,
      title: body.title !== undefined ? body.title.trim() : current.title,
      content: body.content !== undefined ? body.content.trim() : current.content,
      linkUrl: body.linkUrl !== undefined ? body.linkUrl.trim() || undefined : current.linkUrl,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl.trim() || undefined : current.imageUrl,
      objective: body.objective !== undefined ? body.objective.trim() || undefined : current.objective,
      campaign: body.campaign !== undefined ? body.campaign.trim() || undefined : current.campaign,
      cta: body.cta !== undefined ? body.cta.trim() || undefined : current.cta,
      tags: body.tags !== undefined ? body.tags : current.tags,
      keywords: body.keywords !== undefined ? body.keywords : current.keywords,
      mediaAssets: body.mediaAssets !== undefined ? body.mediaAssets : current.mediaAssets,
      aiMetadata: body.aiMetadata !== undefined ? body.aiMetadata : current.aiMetadata,
      updatedAt: new Date().toISOString()
    };

    posts[index] = updated;
    await saveSocialPosts(posts);
    return NextResponse.json({ post: updated });
  } catch (error) {
    logger.error('Failed to update social post', { error });
    return NextResponse.json({ error: 'Failed to update social post' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const posts = await getSocialPosts();
    const filtered = posts.filter((post) => post.id !== params.id);

    if (filtered.length === posts.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await saveSocialPosts(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete social post', { error });
    return NextResponse.json({ error: 'Failed to delete social post' }, { status: 500 });
  }
}
