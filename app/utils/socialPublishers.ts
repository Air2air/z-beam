import { SITE_CONFIG } from '@/app/config/site';
import { logger } from '@/app/utils/logger';
import type { SocialPlatform, SocialPlatformPublishResult, SocialPost } from '@/types';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

function extractLinkedInVanityFromUrl(url: string): string | undefined {
  const match = url.match(/linkedin\.com\/company\/([^/?#]+)/i);
  return match?.[1];
}

function extractFacebookPageIdFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const id = parsed.searchParams.get('id');
    if (id && /^\d+$/.test(id)) {
      return id;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

async function resolveLinkedInOrganizationId(accessToken: string): Promise<string> {
  const explicitId = getEnv('LINKEDIN_ORGANIZATION_ID');
  if (explicitId && /^\d+$/.test(explicitId)) {
    return explicitId;
  }

  const vanityFromEnv = getEnv('LINKEDIN_ORGANIZATION_VANITY');
  const linkedInPageUrl = getEnv('LINKEDIN_PAGE_URL');
  const vanity = vanityFromEnv || (linkedInPageUrl ? extractLinkedInVanityFromUrl(linkedInPageUrl) : undefined);

  if (!vanity) {
    throw new Error('Missing LINKEDIN_ORGANIZATION_ID or LINKEDIN_PAGE_URL / LINKEDIN_ORGANIZATION_VANITY');
  }

  const endpoint = `https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=${encodeURIComponent(vanity)}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0'
    }
  });

  const data = (await response.json()) as { elements?: Array<{ id?: number | string }> };

  const resolvedId = data.elements?.[0]?.id;
  if (!response.ok || !resolvedId) {
    throw new Error(`Unable to resolve LinkedIn organization ID from vanity '${vanity}'`);
  }

  return String(resolvedId);
}

async function resolveLinkedInPersonId(accessToken: string): Promise<string> {
  const explicitPersonId = getEnv('LINKEDIN_PERSON_ID');
  if (explicitPersonId) {
    return explicitPersonId;
  }

  const response = await fetch('https://api.linkedin.com/v2/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0'
    }
  });

  const data = (await response.json()) as { id?: string; message?: string };
  if (response.ok && data.id) {
    return data.id;
  }

  const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const userInfoData = (await userInfoResponse.json()) as { sub?: string; message?: string };
  if (userInfoResponse.ok && userInfoData.sub) {
    return userInfoData.sub;
  }

  throw new Error(
    `Unable to resolve LinkedIn member ID: ${data.message || `HTTP ${response.status}`}; userinfo fallback failed: ${userInfoData.message || `HTTP ${userInfoResponse.status}`}`
  );
}

function resolveFacebookPageId(): string {
  const explicitPageId = getEnv('FACEBOOK_PAGE_ID');
  if (explicitPageId) {
    return explicitPageId;
  }

  const pageUrl = getEnv('FACEBOOK_PAGE_URL');
  if (!pageUrl) {
    throw new Error('Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_URL');
  }

  const parsedId = extractFacebookPageIdFromUrl(pageUrl);
  if (!parsedId) {
    throw new Error('Could not extract FACEBOOK_PAGE_ID from FACEBOOK_PAGE_URL');
  }

  return parsedId;
}

function getPlatformVariant(post: SocialPost, platform: SocialPlatform): { text: string; hashtags: string[] } {
  const variant = post.aiMetadata?.platformVariants?.find((item) => item.platform === platform);
  return {
    text: variant?.text || post.content,
    hashtags: variant?.hashtags || post.aiMetadata?.hashtags || post.tags || []
  };
}

function buildPostText(post: SocialPost, platform: SocialPlatform): string {
  const { text, hashtags } = getPlatformVariant(post, platform);
  const normalizedTags = hashtags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag.replace(/\s+/g, '')}`));

  if (normalizedTags.length === 0) {
    return text;
  }

  return `${text}\n\n${normalizedTags.join(' ')}`;
}

function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${SITE_CONFIG.url}${url.startsWith('/') ? '' : '/'}${url}`;
}

async function publishToLinkedIn(post: SocialPost): Promise<SocialPlatformPublishResult> {
  const accessToken = requireEnv('LINKEDIN_ACCESS_TOKEN');
  const linkedInMode = getEnv('LINKEDIN_POST_MODE');
  const publishedAt = new Date().toISOString();

  const postText = buildPostText(post, 'linkedin');

  if (linkedInMode === 'member') {
    const personId = await resolveLinkedInPersonId(accessToken);

    const payload: Record<string, unknown> = {
      author: `urn:li:person:${personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: postText
          },
          shareMediaCategory: post.linkUrl ? 'ARTICLE' : 'NONE',
          ...(post.linkUrl
            ? {
                media: [
                  {
                    status: 'READY',
                    originalUrl: post.linkUrl,
                    title: {
                      text: post.title
                    }
                  }
                ]
              }
            : {})
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`LinkedIn member publish failed (${response.status}): ${body}`);
    }

    const linkedInId = response.headers.get('x-restli-id') || undefined;

    return {
      platform: 'linkedin',
      status: 'success',
      externalPostId: linkedInId,
      publishedAt
    };
  }

  const organizationId = await resolveLinkedInOrganizationId(accessToken);

  const payload: Record<string, unknown> = {
    author: `urn:li:organization:${organizationId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: postText
        },
        shareMediaCategory: post.linkUrl ? 'ARTICLE' : 'NONE',
        ...(post.linkUrl
          ? {
              media: [
                {
                  status: 'READY',
                  originalUrl: post.linkUrl,
                  title: {
                    text: post.title
                  }
                }
              ]
            }
          : {})
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LinkedIn publish failed (${response.status}): ${body}`);
  }

  const linkedInId = response.headers.get('x-restli-id') || undefined;

  return {
    platform: 'linkedin',
    status: 'success',
    externalPostId: linkedInId,
    publishedAt
  };
}

async function publishToFacebook(post: SocialPost): Promise<SocialPlatformPublishResult> {
  const pageId = resolveFacebookPageId();
  const accessToken = requireEnv('FACEBOOK_PAGE_ACCESS_TOKEN');
  const publishedAt = new Date().toISOString();

  const postText = buildPostText(post, 'facebook');

  const hasImageOnly = !!post.imageUrl && !post.linkUrl;
  const endpoint = hasImageOnly
    ? `https://graph.facebook.com/v22.0/${pageId}/photos`
    : `https://graph.facebook.com/v22.0/${pageId}/feed`;

  const params = new URLSearchParams();
  params.append('access_token', accessToken);

  if (hasImageOnly && post.imageUrl) {
    params.append('url', toAbsoluteUrl(post.imageUrl));
    params.append('caption', postText);
  } else {
    params.append('message', postText);
    if (post.linkUrl) {
      params.append('link', post.linkUrl);
    }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const json = (await response.json()) as { id?: string; error?: { message?: string } };

  if (!response.ok || json.error) {
    throw new Error(`Facebook publish failed (${response.status}): ${json.error?.message || 'Unknown error'}`);
  }

  return {
    platform: 'facebook',
    status: 'success',
    externalPostId: json.id,
    publishedAt
  };
}

async function publishToX(post: SocialPost): Promise<SocialPlatformPublishResult> {
  const bearerToken = requireEnv('X_BEARER_TOKEN');
  const publishedAt = new Date().toISOString();

  const baseText = buildPostText(post, 'x');
  const text = post.linkUrl ? `${baseText}\n\n${post.linkUrl}` : baseText;
  const payload: Record<string, unknown> = {
    text
  };

  const response = await fetch('https://api.x.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const json = (await response.json()) as {
    data?: { id?: string };
    errors?: Array<{ detail?: string; message?: string }>;
    title?: string;
    detail?: string;
  };

  if (!response.ok || !json.data?.id) {
    const errorMessage =
      json.errors?.[0]?.detail ||
      json.errors?.[0]?.message ||
      json.detail ||
      json.title ||
      'Unknown error';
    throw new Error(`X publish failed (${response.status}): ${errorMessage}`);
  }

  return {
    platform: 'x',
    status: 'success',
    externalPostId: json.data.id,
    publishedAt
  };
}

async function publishToGoogleBusiness(post: SocialPost): Promise<SocialPlatformPublishResult> {
  const accessToken = requireEnv('GOOGLE_BUSINESS_ACCESS_TOKEN');
  const accountId = requireEnv('GOOGLE_BUSINESS_ACCOUNT_ID');
  const locationId = requireEnv('GOOGLE_BUSINESS_LOCATION_ID');
  const publishedAt = new Date().toISOString();

  const postText = buildPostText(post, 'google_business');

  const firstImage = post.mediaAssets?.find((asset) => asset.type === 'image')?.url || post.imageUrl;

  const endpoint = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`;
  const payload: Record<string, unknown> = {
    languageCode: 'en-US',
    summary: postText,
    topicType: 'STANDARD',
    ...(post.linkUrl
      ? {
          callToAction: {
            actionType: 'LEARN_MORE',
            url: post.linkUrl
          }
        }
      : {}),
    ...(firstImage
      ? {
          media: [
            {
              mediaFormat: 'PHOTO',
              sourceUrl: toAbsoluteUrl(firstImage)
            }
          ]
        }
      : {})
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const json = (await response.json()) as { name?: string; error?: { message?: string } };

  if (!response.ok || json.error) {
    throw new Error(`Google Business publish failed (${response.status}): ${json.error?.message || 'Unknown error'}`);
  }

  return {
    platform: 'google_business',
    status: 'success',
    externalPostId: json.name,
    publishedAt
  };
}

export async function publishPostToPlatforms(post: SocialPost): Promise<SocialPlatformPublishResult[]> {
  const results: SocialPlatformPublishResult[] = [];

  for (const platform of post.platforms) {
    try {
      if (platform === 'linkedin') {
        results.push(await publishToLinkedIn(post));
      } else if (platform === 'facebook') {
        results.push(await publishToFacebook(post));
      } else if (platform === 'x') {
        results.push(await publishToX(post));
      } else if (platform === 'google_business') {
        results.push(await publishToGoogleBusiness(post));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown publishing error';
      logger.error('Platform publish failed', { platform, message, postId: post.id });

      results.push({
        platform,
        status: 'failed',
        error: message,
        publishedAt: new Date().toISOString()
      });
    }
  }

  return results;
}
