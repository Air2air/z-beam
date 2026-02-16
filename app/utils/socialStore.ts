import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { SocialPost } from '@/types';

function resolveSocialDataDir(): string {
  const configuredDir = process.env.SOCIAL_STORE_DIR?.trim();
  if (configuredDir) {
    return configuredDir;
  }

  // Vercel serverless filesystem is read-only except /tmp
  if (process.env.VERCEL === '1') {
    return '/tmp/z-beam-social';
  }

  return path.join(process.cwd(), 'data', 'social');
}

function resolveSocialPostsFile(): string {
  return path.join(resolveSocialDataDir(), 'posts.json');
}

async function ensureSocialStore(): Promise<void> {
  const socialDataDir = resolveSocialDataDir();
  const socialPostsFile = resolveSocialPostsFile();

  await mkdir(socialDataDir, { recursive: true });

  try {
    await readFile(socialPostsFile, 'utf8');
  } catch {
    await writeFile(socialPostsFile, '[]', 'utf8');
  }
}

export async function getSocialPosts(): Promise<SocialPost[]> {
  await ensureSocialStore();
  const raw = await readFile(resolveSocialPostsFile(), 'utf8');
  const parsed = JSON.parse(raw) as SocialPost[];

  return parsed.sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime();
    const bTime = new Date(b.updatedAt).getTime();
    return bTime - aTime;
  });
}

export async function saveSocialPosts(posts: SocialPost[]): Promise<void> {
  await ensureSocialStore();
  await writeFile(resolveSocialPostsFile(), JSON.stringify(posts, null, 2), 'utf8');
}
