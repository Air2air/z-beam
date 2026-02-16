'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import type {
  SocialAIMetadataProvider,
  SocialCreatePostPayload,
  SocialMediaAsset,
  SocialMediaUploadResponse,
  SocialPlatform,
  SocialPlatformPublishResult,
  SocialPlatformVariant,
  SocialPost,
  SocialPostStatus
} from '@/types';

interface SocialPostsResponse {
  posts: SocialPost[];
}

interface SocialPostResponse {
  post: SocialPost;
  results?: SocialPlatformPublishResult[];
  error?: string;
}

interface SocialAIEnrichmentResponse {
  hook: string;
  cta: string;
  hashtags: string[];
  keywords: string[];
  platformVariants: SocialPlatformVariant[];
  notes: string[];
}

const PLATFORM_OPTIONS: Array<{ label: string; value: SocialPlatform }> = [
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Google Business Profile', value: 'google_business' },
  { label: 'X (Twitter)', value: 'x' }
];

const STATUS_OPTIONS: Array<{ label: string; value: SocialPostStatus }> = [
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Published', value: 'published' }
];

function formatPlatformLabel(platform: SocialPlatform): string {
  switch (platform) {
    case 'linkedin':
      return 'LinkedIn';
    case 'facebook':
      return 'Facebook';
    case 'google_business':
      return 'Google Business';
    case 'x':
      return 'X';
    default:
      return platform;
  }
}

export default function SocialDashboardClient(): JSX.Element {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isEnriching, setIsEnriching] = useState<boolean>(false);
  const [publishingPostId, setPublishingPostId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [objective, setObjective] = useState<string>('');
  const [campaign, setCampaign] = useState<string>('');
  const [cta, setCta] = useState<string>('Book a laser cleaning consultation.');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [keywordsInput, setKeywordsInput] = useState<string>('');
  const [aiProvider, setAiProvider] = useState<SocialAIMetadataProvider>('grok');
  const [aiNotes, setAiNotes] = useState<string[]>([]);
  const [platformVariants, setPlatformVariants] = useState<SocialPlatformVariant[]>([]);
  const [mediaAssets, setMediaAssets] = useState<SocialMediaAsset[]>([]);
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [status, setStatus] = useState<SocialPostStatus>('draft');
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(['linkedin']);

  async function loadPosts(): Promise<void> {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/social/posts');
      if (!response.ok) {
        throw new Error('Failed to load social posts');
      }

      const data = (await response.json()) as SocialPostsResponse;
      setPosts(data.posts || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load social posts';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  const postCountLabel = useMemo(() => {
    if (posts.length === 1) {
      return '1 post';
    }

    return `${posts.length} posts`;
  }, [posts.length]);

  function togglePlatform(platform: SocialPlatform): void {
    setPlatforms((current) => {
      if (current.includes(platform)) {
        const next = current.filter((item) => item !== platform);
        return next.length > 0 ? next : current;
      }

      return [...current, platform];
    });
  }

  function parseCsvInput(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function enrichWithAI(): Promise<void> {
    if (!title.trim() || !content.trim()) {
      setErrorMessage('Title and content are required before AI enrichment');
      return;
    }

    setIsEnriching(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/social/ai/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: aiProvider,
          objective,
          title,
          content,
          cta,
          linkUrl,
          platforms
        })
      });

      if (!response.ok) {
        throw new Error('AI enrichment failed');
      }

      const data = (await response.json()) as SocialAIEnrichmentResponse;

      if (data.hook) {
        setContent(`${data.hook}\n\n${content}`);
      }

      if (data.cta) {
        setCta(data.cta);
      }

      if (data.hashtags.length > 0) {
        setTagsInput(data.hashtags.join(', '));
      }

      if (data.keywords.length > 0) {
        setKeywordsInput(data.keywords.join(', '));
      }

      setPlatformVariants(data.platformVariants || []);
      setAiNotes(data.notes || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI enrichment failed';
      setErrorMessage(message);
    } finally {
      setIsEnriching(false);
    }
  }

  async function handleMediaUpload(event: FormEvent<HTMLInputElement>): Promise<void> {
    const input = event.currentTarget;
    const selectedFiles = input.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      Array.from(selectedFiles).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/social/upload-media', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Media upload failed');
      }

      const data = (await response.json()) as SocialMediaUploadResponse;
      setMediaAssets((current) => [...current, ...data.assets]);

      const firstImage = data.assets.find((asset) => asset.type === 'image')?.url;
      if (firstImage && !imageUrl) {
        setImageUrl(firstImage);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Media upload failed';
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
      input.value = '';
    }
  }

  async function handleCreatePost(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    try {
      const payload: SocialCreatePostPayload = {
        title,
        content,
        objective,
        campaign: campaign || undefined,
        cta: cta || undefined,
        linkUrl: linkUrl || undefined,
        imageUrl: imageUrl || undefined,
        mediaAssets,
        tags: parseCsvInput(tagsInput),
        keywords: parseCsvInput(keywordsInput),
        aiMetadata: platformVariants.length > 0 || aiNotes.length > 0
          ? {
              provider: aiProvider,
              objective,
              cta,
              hashtags: parseCsvInput(tagsInput),
              keywords: parseCsvInput(keywordsInput),
              platformVariants,
              notes: aiNotes
            }
          : undefined,
        platforms,
        status,
        scheduledAt: status === 'scheduled' && scheduledAt ? scheduledAt : undefined
      };

      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to create social post');
      }

      const data = (await response.json()) as SocialPostResponse;
      setPosts((current) => [data.post, ...current]);

      setTitle('');
      setContent('');
      setObjective('');
      setCampaign('');
      setCta('Book a laser cleaning consultation.');
      setLinkUrl('');
      setImageUrl('');
      setTagsInput('');
      setKeywordsInput('');
      setPlatformVariants([]);
      setAiNotes([]);
      setMediaAssets([]);
      setScheduledAt('');
      setStatus('draft');
      setPlatforms(['linkedin']);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create post';
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function updatePostStatus(postId: string, nextStatus: SocialPostStatus): Promise<void> {
    setErrorMessage('');

    try {
      const response = await fetch(`/api/social/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update post status');
      }

      const data = (await response.json()) as SocialPostResponse;
      setPosts((current) => current.map((post) => (post.id === postId ? data.post : post)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update post';
      setErrorMessage(message);
    }
  }

  async function deletePost(postId: string): Promise<void> {
    setErrorMessage('');

    try {
      const response = await fetch(`/api/social/posts/${postId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setPosts((current) => current.filter((post) => post.id !== postId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete post';
      setErrorMessage(message);
    }
  }

  async function publishNow(postId: string): Promise<void> {
    setPublishingPostId(postId);
    setErrorMessage('');

    try {
      const response = await fetch(`/api/social/posts/${postId}/publish`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to publish post');
      }

      const data = (await response.json()) as SocialPostResponse;
      setPosts((current) => current.map((post) => (post.id === postId ? data.post : post)));

      if (data.error) {
        setErrorMessage(data.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to publish post';
      setErrorMessage(message);
    } finally {
      setPublishingPostId('');
    }
  }

  function getPreviewForPlatform(platform: SocialPlatform): { text: string; hashtags: string[] } {
    const variant = platformVariants.find((item) => item.platform === platform);
    if (variant) {
      return {
        text: variant.text,
        hashtags: variant.hashtags
      };
    }

    return {
      text: content,
      hashtags: parseCsvInput(tagsInput)
    };
  }

  function getNativePreviewUrl(platform: SocialPlatform): string {
    const preview = getPreviewForPlatform(platform);
    const shareUrl = encodeURIComponent(linkUrl.trim() || 'https://z-beam.com');
    const previewText = preview.hashtags.length > 0
      ? `${preview.text}\n\n${preview.hashtags.join(' ')}`
      : preview.text;
    const encodedText = encodeURIComponent(previewText);

    switch (platform) {
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
      case 'x':
        return `https://twitter.com/intent/tweet?text=${encodedText}&url=${shareUrl}`;
      case 'google_business':
        return 'https://business.google.com/';
      default:
        return 'https://z-beam.com';
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-secondary">Social Publishing Dashboard</h1>
        <p className="text-tertiary">Create, manage, and upload posts/images from one panel.</p>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-red-500/40 bg-red-900/20 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <section className="rounded-xl border border-white/10 bg-primary p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-secondary mb-4">Create Post</h2>

        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-primary" htmlFor="social-title">Title</label>
            <input
              id="social-title"
              className="w-full rounded-md border border-white/20 bg-gray-800/50 px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-primary" htmlFor="social-content">Post Content</label>
            <textarea
              id="social-content"
              className="min-h-36 w-full rounded-md border border-white/20 bg-gray-800/50 px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-primary" htmlFor="social-ai-provider">AI Provider</label>
              <select
                id="social-ai-provider"
                className="w-full rounded-md border border-white/20 bg-gray-800/50 px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                value={aiProvider}
                onChange={(event) => setAiProvider(event.target.value as SocialAIMetadataProvider)}
              >
                <option value="grok">Grok</option>
                <option value="deepseek">DeepSeek</option>
              </select>
            </div>

            <details className="rounded-md border border-white/10 bg-secondary p-3">
              <summary className="cursor-pointer text-sm font-semibold text-secondary">Advanced (optional): Objective + Campaign</summary>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" htmlFor="social-objective">Objective</label>
                  <input
                    id="social-objective"
                    className="w-full rounded-md border border-white/20 bg-gray-800/50 px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                    value={objective}
                    onChange={(event) => setObjective(event.target.value)}
                    placeholder="Lead generation"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" htmlFor="social-campaign">Campaign</label>
                  <input
                    id="social-campaign"
                    className="w-full rounded-md border border-white/20 bg-gray-800/50 px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                    value={campaign}
                    onChange={(event) => setCampaign(event.target.value)}
                    placeholder="Q1-rental-push"
                  />
                </div>
              </div>
            </details>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
            <label className="mb-1 block text-sm font-medium text-primary" htmlFor="social-cta">Call to Action</label>
            <input
              id="social-cta"
              className="w-full rounded-md border border-white/20 bg-gray-800/50 px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              value={cta}
              onChange={(event) => setCta(event.target.value)}
              placeholder="Book a laser cleaning consultation"
            />
          </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-primary" htmlFor="social-link">Website Link</label>
              <input
                id="social-link"
                className="w-full rounded-md border border-white/20 bg-gray-800/50 px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://z-beam.com/..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-primary" htmlFor="social-status">Status</label>
              <select
                id="social-status"
                className="w-full rounded-md border border-white/20 bg-gray-800/50 px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                value={status}
                onChange={(event) => setStatus(event.target.value as SocialPostStatus)}
              >
                {STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
          </div>

          {status === 'scheduled' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-primary" htmlFor="social-scheduled-at">Schedule Time</label>
              <input
                id="social-scheduled-at"
                type="datetime-local"
                className="w-full rounded-md border border-white/20 bg-gray-800/50 px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
              />
            </div>
          )}

          <div>
            <span className="mb-1 block text-sm font-medium text-primary">Platforms</span>
            <div className="flex flex-wrap gap-3">
              {PLATFORM_OPTIONS.map((option) => (
                <label key={option.value} className="inline-flex items-center gap-2 rounded border border-white/20 bg-secondary px-3 py-2 text-sm text-primary">
                  <input
                    type="checkbox"
                    checked={platforms.includes(option.value)}
                    onChange={() => togglePlatform(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void enrichWithAI();
              }}
              disabled={isEnriching}
              className="inline-flex items-center rounded-md border border-emerald-400/40 bg-emerald-900/20 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-900/35 disabled:opacity-50"
            >
              {isEnriching ? 'Generating metadata...' : `Generate Tags + Metadata (${aiProvider})`}
            </button>
            <button
              type="button"
              onClick={() => {
                window.open(getNativePreviewUrl(platforms[0] || 'linkedin'), '_blank', 'noopener,noreferrer');
              }}
              className="inline-flex items-center rounded-md border border-white/20 bg-secondary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary"
            >
              Open Native Preview Flow
            </button>
            {aiNotes.length > 0 && <span className="text-xs text-tertiary">AI notes available below</span>}
          </div>

          <div className="rounded border border-white/10 bg-secondary p-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Platform Native Preview Links</p>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <a
                  key={`native-preview-${platform}`}
                  href={getNativePreviewUrl(platform)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-white/20 bg-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-secondary"
                >
                  Open {formatPlatformLabel(platform)} Composer
                </a>
              ))}
            </div>
            {linkUrl && (
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={`https://www.linkedin.com/post-inspector/inspect/?url=${encodeURIComponent(linkUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-blue-400/40 bg-blue-900/20 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-900/35"
                >
                  Check LinkedIn Link Preview
                </a>
                <a
                  href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(linkUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-blue-400/40 bg-blue-900/20 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-900/35"
                >
                  Check Facebook Link Preview
                </a>
              </div>
            )}
            {!linkUrl && (
              <p className="text-xs text-tertiary">
                Add a Website Link to validate real link-card previews in LinkedIn/Facebook tools.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-primary" htmlFor="social-tags">Hashtags (comma-separated)</label>
              <input
                id="social-tags"
                className="w-full rounded-md border border-white/20 bg-gray-800/50 px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="#LaserCleaning, #Aerospace, #IndustrialMaintenance"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-primary" htmlFor="social-keywords">Keywords (comma-separated)</label>
              <input
                id="social-keywords"
                className="w-full rounded-md border border-white/20 bg-gray-800/50 px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                value={keywordsInput}
                onChange={(event) => setKeywordsInput(event.target.value)}
                placeholder="laser cleaning rental, rust removal, surface prep"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary" htmlFor="social-image-upload">Photos + Videos Upload</label>
            <input
              id="social-image-upload"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,video/webm"
              onInput={handleMediaUpload}
              disabled={isUploading}
              className="block w-full text-sm text-primary"
            />
            {isUploading && <p className="text-xs text-tertiary">Uploading media...</p>}
            {mediaAssets.length > 0 && (
              <div className="rounded border border-white/10 bg-secondary p-3 space-y-2">
                <p className="text-xs text-tertiary">Uploaded assets: {mediaAssets.length}</p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {mediaAssets.map((asset) => (
                    <div key={asset.id} className="rounded border border-white/10 bg-primary p-2 text-xs text-tertiary">
                      <p className="font-medium text-primary">{asset.fileName}</p>
                      <p>{asset.type.toUpperCase()} • {asset.mimeType}</p>
                      <p className="truncate">{asset.url}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {aiNotes.length > 0 && (
            <div className="rounded border border-amber-200 bg-amber-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">AI Guidance</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">
                {aiNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {platformVariants.length > 0 && (
            <div className="rounded border border-white/10 bg-secondary p-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Platform Previews</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {platformVariants.map((variant) => (
                  <article key={variant.platform} className="rounded border border-white/10 bg-primary p-3">
                    <p className="text-xs font-semibold text-tertiary">{formatPlatformLabel(variant.platform)}</p>
                    <p className="mt-2 text-sm text-primary whitespace-pre-line">{variant.text}</p>
                    {variant.hashtags.length > 0 && (
                      <p className="mt-2 text-xs text-tertiary">{variant.hashtags.join(' ')}</p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center rounded-md bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-brand-orange-dark disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Create Post'}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-white/10 bg-primary p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-secondary">Manage Posts</h2>
          <span className="text-sm text-tertiary">{postCountLabel}</span>
        </div>

        {isLoading ? (
          <p className="text-sm text-tertiary">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-tertiary">No posts yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article key={post.id} className="rounded-lg border border-white/10 bg-secondary p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-secondary">{post.title}</h3>
                    {(post.objective || post.campaign) && (
                      <p className="text-xs text-tertiary">
                        {post.objective ? `Objective: ${post.objective}` : ''}
                        {post.objective && post.campaign ? ' • ' : ''}
                        {post.campaign ? `Campaign: ${post.campaign}` : ''}
                      </p>
                    )}
                    <p className="text-sm text-primary whitespace-pre-line">{post.content}</p>
                    {post.cta && <p className="text-sm font-medium text-secondary">CTA: {post.cta}</p>}
                    {post.linkUrl && (
                      <a href={post.linkUrl} target="_blank" rel="noreferrer" className="text-sm text-orange-400 underline hover:text-orange-300">
                        {post.linkUrl}
                      </a>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <p className="text-xs text-tertiary">Tags: {post.tags.join(', ')}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {post.platforms.map((platform) => (
                        <span key={`${post.id}-${platform}`} className="rounded-full border border-white/10 bg-primary px-2 py-1 text-xs font-medium text-primary">
                          {formatPlatformLabel(platform)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="min-w-44 space-y-2">
                    <label className="block text-xs font-medium uppercase tracking-wide text-tertiary" htmlFor={`status-${post.id}`}>
                      Status
                    </label>
                    <select
                      id={`status-${post.id}`}
                      className="w-full rounded border border-white/20 bg-gray-800/50 px-2 py-1 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                      value={post.status}
                      onChange={(event) => {
                        void updatePostStatus(post.id, event.target.value as SocialPostStatus);
                      }}
                    >
                      {STATUS_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        void publishNow(post.id);
                      }}
                      disabled={publishingPostId === post.id}
                      className="w-full rounded border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-sm text-orange-300 hover:bg-orange-500/20 disabled:opacity-50"
                    >
                      {publishingPostId === post.id ? 'Publishing...' : 'Publish Now'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void deletePost(post.id);
                      }}
                      className="w-full rounded border border-red-500/40 bg-red-900/20 px-3 py-1.5 text-sm text-red-300 hover:bg-red-900/35"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {post.imageUrl && (
                  <div className="mt-3">
                    <img src={post.imageUrl} alt={`${post.title} social image`} className="max-h-56 rounded border border-white/10" />
                  </div>
                )}

                {post.mediaAssets && post.mediaAssets.length > 0 && (
                  <div className="mt-3 rounded border border-white/10 bg-primary p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-tertiary">Attached Media ({post.mediaAssets.length})</p>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {post.mediaAssets.map((asset) => (
                        <div key={asset.id} className="rounded border border-white/10 bg-secondary p-2 text-xs text-tertiary">
                          <p className="font-medium text-primary">{asset.fileName}</p>
                          <p>{asset.type.toUpperCase()} • {asset.mimeType}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {post.publicationResults && post.publicationResults.length > 0 && (
                  <div className="mt-3 rounded border border-white/10 bg-primary p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-tertiary">Publishing Results</p>
                    <ul className="space-y-1 text-sm">
                      {post.publicationResults.map((result) => (
                        <li key={`${post.id}-${result.platform}-${result.publishedAt}`}>
                          <span className="font-medium">{formatPlatformLabel(result.platform)}</span>
                          {': '}
                          {result.status === 'success' ? (
                            <span className="text-emerald-700">Published</span>
                          ) : (
                            <span className="text-red-700">Failed{result.error ? ` - ${result.error}` : ''}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="mt-3 text-xs text-tertiary">
                  Updated {new Date(post.updatedAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
