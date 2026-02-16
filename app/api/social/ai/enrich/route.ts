import { NextRequest, NextResponse } from 'next/server';
import type { SocialAIMetadataProvider, SocialPlatform, SocialPlatformVariant } from '@/types';
import { logger } from '@/app/utils/logger';

interface EnrichRequestBody {
  provider: SocialAIMetadataProvider;
  objective?: string;
  title: string;
  content: string;
  cta?: string;
  linkUrl?: string;
  platforms: SocialPlatform[];
}

interface EnrichResponseBody {
  hook: string;
  cta: string;
  hashtags: string[];
  keywords: string[];
  platformVariants: SocialPlatformVariant[];
  notes: string[];
}

function getModelConfig(provider: SocialAIMetadataProvider): { url: string; keyName: string; model: string } {
  if (provider === 'grok') {
    return {
      url: 'https://api.x.ai/v1/chat/completions',
      keyName: 'XAI_API_KEY',
      model: 'grok-3-mini'
    };
  }

  return {
    url: 'https://api.deepseek.com/chat/completions',
    keyName: 'DEEPSEEK_API_KEY',
    model: 'deepseek-chat'
  };
}

function parseJsonResponse(raw: string): EnrichResponseBody {
  const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const parsed = JSON.parse(cleaned) as Partial<EnrichResponseBody>;

  return {
    hook: parsed.hook || '',
    cta: parsed.cta || '',
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    platformVariants: Array.isArray(parsed.platformVariants) ? parsed.platformVariants : [],
    notes: Array.isArray(parsed.notes) ? parsed.notes : []
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as EnrichRequestBody;

    if (!body.title || !body.content || !body.provider || !Array.isArray(body.platforms) || body.platforms.length === 0) {
      return NextResponse.json(
        { error: 'provider, title, content, and platforms are required' },
        { status: 400 }
      );
    }

    const { url, keyName, model } = getModelConfig(body.provider);
    const apiKey = process.env[keyName];
    if (!apiKey) {
      return NextResponse.json({ error: `Missing API key: ${keyName}` }, { status: 500 });
    }

    const prompt = [
      'You are a senior B2B social media strategist for industrial laser cleaning.',
      'Return ONLY valid JSON with this exact shape:',
      '{"hook":"string","cta":"string","hashtags":["#tag"],"keywords":["keyword"],"platformVariants":[{"platform":"linkedin|facebook|google_business|x","text":"string","hashtags":["#tag"]}],"notes":["string"]}',
      `Objective: ${body.objective || 'qualified lead generation'}`,
      `Title: ${body.title}`,
      `Content: ${body.content}`,
      `CTA: ${body.cta || ''}`,
      `Link: ${body.linkUrl || ''}`,
      `Platforms: ${body.platforms.join(', ')}`,
      'Constraints: keep language professional, practical, and non-hype. Keep X variant concise. Use 3-8 hashtags total.'
    ].join('\n');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!response.ok || json.error) {
      return NextResponse.json(
        { error: `AI enrichment failed: ${json.error?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'AI enrichment returned empty response' }, { status: 500 });
    }

    const parsed = parseJsonResponse(content);
    return NextResponse.json(parsed);
  } catch (error) {
    logger.error('Failed to enrich social post with AI', { error });
    return NextResponse.json({ error: 'Failed to enrich social post with AI' }, { status: 500 });
  }
}
