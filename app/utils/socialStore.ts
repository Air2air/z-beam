import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { SocialPost } from '@/types';

const SOCIAL_DATA_DIR = path.join(process.cwd(), 'data', 'social');
const SOCIAL_POSTS_FILE = path.join(SOCIAL_DATA_DIR, 'posts.json');

async function ensureSocialStore(): Promise<void> {
  await mkdir(SOCIAL_DATA_DIR, { recursive: true });

  try {
    await readFile(SOCIAL_POSTS_FILE, 'utf8');
  } catch {
    await writeFile(SOCIAL_POSTS_FILE, '[]', 'utf8');
  }
}

export async function getSocialPosts(): Promise<SocialPost[]> {
  await ensureSocialStore();
  const raw = await readFile(SOCIAL_POSTS_FILE, 'utf8');
  const parsed = JSON.parse(raw) as SocialPost[];

  return parsed.sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime();
    const bTime = new Date(b.updatedAt).getTime();
    return bTime - aTime;
  });
}

export async function saveSocialPosts(posts: SocialPost[]): Promise<void> {
  await ensureSocialStore();
  await writeFile(SOCIAL_POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
}
