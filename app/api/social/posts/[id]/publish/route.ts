import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { publishPostToPlatforms } from '@/app/utils/socialPublishers';
import { getSocialPosts, saveSocialPosts } from '@/app/utils/socialStore';
import type { SocialPost } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const body = (await request.json().catch(() => ({}))) as { post?: SocialPost };
    const posts = await getSocialPosts();
    const index = posts.findIndex((post) => post.id === params.id);

    const post = index === -1 ? body.post : posts[index];
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const results = await publishPostToPlatforms(post);
    const publishedAt = new Date().toISOString();
    const hasFailures = results.some((result) => result.status === 'failed');

    const updatedPost = {
      ...post,
      status: hasFailures ? post.status : 'published',
      publishedAt: hasFailures ? post.publishedAt : publishedAt,
      publicationResults: results,
      updatedAt: publishedAt
    };

    if (index !== -1) {
      posts[index] = updatedPost;
      await saveSocialPosts(posts);
    }

    if (hasFailures) {
      return NextResponse.json(
        {
          post: updatedPost,
          error: 'One or more platform publishes failed',
          results
        },
        { status: 207 }
      );
    }

    return NextResponse.json({ post: updatedPost, results });
  } catch (error) {
    logger.error('Failed to publish social post', { error, postId: params.id });
    return NextResponse.json({ error: 'Failed to publish social post' }, { status: 500 });
  }
}
