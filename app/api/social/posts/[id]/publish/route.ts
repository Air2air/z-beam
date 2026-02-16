import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { publishPostToPlatforms } from '@/app/utils/socialPublishers';
import { getSocialPosts, saveSocialPosts } from '@/app/utils/socialStore';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const posts = await getSocialPosts();
    const index = posts.findIndex((post) => post.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = posts[index];
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

    posts[index] = updatedPost;
    await saveSocialPosts(posts);

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
