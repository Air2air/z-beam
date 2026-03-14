#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_LOG = path.join(process.cwd(), 'logs', 'access.log');
const LOG_PATH = process.argv[2] || process.env.BOT_LOG_PATH || DEFAULT_LOG;
const STRICT_MODE = process.argv.includes('--strict') || process.env.STRICT_MODE === '1';

const BOT_REGEX = /(googlebot|bingbot|duckduckbot|yandexbot|baiduspider|slurp|applebot|facebookexternalhit|twitterbot)/i;
const LINE_REGEX = /"(GET|POST|HEAD|PUT|DELETE|OPTIONS)\s+([^\s]+)[^"]*"\s+(\d{3})\s+[^\s]+\s+"[^"]*"\s+"([^"]*)"/;

function bucketStatus(statusCode) {
  const firstDigit = String(statusCode)[0];
  return `${firstDigit}xx`;
}

function main() {
  if (!fs.existsSync(LOG_PATH)) {
    console.log(`ℹ️ Bot log file not found: ${LOG_PATH}`);
    console.log('   Provide a log file path: node scripts/seo/advanced/analyze-bot-logs.js /path/to/access.log');
    process.exit(0);
  }

  const text = fs.readFileSync(LOG_PATH, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);

  const summary = {
    totalLines: lines.length,
    botHits: 0,
    bots: {},
    statusBuckets: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
    topUrls: {},
  };

  for (const line of lines) {
    const match = line.match(LINE_REGEX);
    if (!match) continue;

    const [, , rawUrl, statusRaw, userAgent] = match;
    const botMatch = userAgent.match(BOT_REGEX);
    if (!botMatch) continue;

    const botName = botMatch[1].toLowerCase();
    const status = Number(statusRaw);
    const pathname = rawUrl.split('?')[0];

    summary.botHits += 1;
    summary.bots[botName] = (summary.bots[botName] || 0) + 1;

    const bucket = bucketStatus(status);
    if (summary.statusBuckets[bucket] !== undefined) {
      summary.statusBuckets[bucket] += 1;
    }

    summary.topUrls[pathname] = (summary.topUrls[pathname] || 0) + 1;
  }

  const topBots = Object.entries(summary.bots)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topUrls = Object.entries(summary.topUrls)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  console.log('🤖 Bot log analysis');
  console.log(`   Log file: ${LOG_PATH}`);
  console.log(`   Total lines: ${summary.totalLines}`);
  console.log(`   Bot hits: ${summary.botHits}`);
  console.log(`   2xx/3xx/4xx/5xx: ${summary.statusBuckets['2xx']}/${summary.statusBuckets['3xx']}/${summary.statusBuckets['4xx']}/${summary.statusBuckets['5xx']}`);

  console.log('\nTop bots:');
  topBots.forEach(([bot, hits]) => {
    console.log(`   - ${bot}: ${hits}`);
  });

  console.log('\nTop crawled URLs:');
  topUrls.forEach(([url, hits]) => {
    console.log(`   - ${url}: ${hits}`);
  });

  if (summary.statusBuckets['5xx'] > 0) {
    if (!STRICT_MODE) {
      console.log('\n⚠️ Bot hits on 5xx responses detected (advisory mode). Re-run with --strict to enforce blocking.');
      return;
    }

    console.log('\n❌ Detected bot hits on 5xx responses');
    process.exit(1);
  }

  console.log('\n✅ Bot log analysis complete');
}

main();
