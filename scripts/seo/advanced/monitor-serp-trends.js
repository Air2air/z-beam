#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data', 'seo');
const LATEST_FILE = path.join(DATA_DIR, 'serp-latest.json');
const BASELINE_FILE = path.join(DATA_DIR, 'serp-baseline.json');
const HISTORY_DIR = path.join(DATA_DIR, 'serp-history');

const DROP_THRESHOLD = Number(process.env.SERP_DROP_THRESHOLD || 0.3);
const MIN_IMPRESSIONS = Number(process.env.SERP_MIN_IMPRESSIONS || 100);
const FAIL_ON_ANOMALY = process.env.SERP_FAIL_ON_ANOMALY === 'true';

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function aggregateByPage(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const page = row.page || row.url;
    if (!page) continue;
    if (!map.has(page)) {
      map.set(page, { page, clicks: 0, impressions: 0, ctrWeightedNumerator: 0, positionWeightedNumerator: 0 });
    }

    const entry = map.get(page);
    const clicks = Number(row.clicks || 0);
    const impressions = Number(row.impressions || 0);
    const ctr = Number(row.ctr || 0);
    const position = Number(row.position || 0);

    entry.clicks += clicks;
    entry.impressions += impressions;
    entry.ctrWeightedNumerator += ctr * impressions;
    entry.positionWeightedNumerator += position * impressions;
  }

  return Array.from(map.values()).map((entry) => ({
    page: entry.page,
    clicks: entry.clicks,
    impressions: entry.impressions,
    ctr: entry.impressions > 0 ? entry.ctrWeightedNumerator / entry.impressions : 0,
    position: entry.impressions > 0 ? entry.positionWeightedNumerator / entry.impressions : 0,
  }));
}

function indexByPage(rows) {
  return new Map(rows.map((row) => [row.page, row]));
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function main() {
  ensureDir(DATA_DIR);
  ensureDir(HISTORY_DIR);

  const latestRaw = loadJson(LATEST_FILE);
  if (!latestRaw || !Array.isArray(latestRaw)) {
    console.log(`ℹ️ No latest SERP data found at ${LATEST_FILE}; skipping.`);
    process.exit(0);
  }

  const latest = aggregateByPage(latestRaw);
  const baselineRaw = loadJson(BASELINE_FILE);
  const baseline = baselineRaw && Array.isArray(baselineRaw) ? baselineRaw : null;

  const snapshotPath = path.join(HISTORY_DIR, `${nowStamp()}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify(latest, null, 2), 'utf8');

  if (!baseline) {
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(latest, null, 2), 'utf8');
    console.log('✅ Created initial SERP baseline from latest snapshot');
    console.log(`   Baseline: ${BASELINE_FILE}`);
    console.log(`   Snapshot: ${snapshotPath}`);
    return;
  }

  const baselineMap = indexByPage(baseline);
  const anomalies = [];

  for (const current of latest) {
    const previous = baselineMap.get(current.page);
    if (!previous) continue;
    if (Math.max(current.impressions, previous.impressions) < MIN_IMPRESSIONS) continue;

    const clickDrop = previous.clicks > 0 ? (previous.clicks - current.clicks) / previous.clicks : 0;
    const ctrDrop = previous.ctr > 0 ? (previous.ctr - current.ctr) / previous.ctr : 0;

    if (clickDrop >= DROP_THRESHOLD || ctrDrop >= DROP_THRESHOLD) {
      anomalies.push({
        page: current.page,
        previous,
        current,
        clickDrop,
        ctrDrop,
      });
    }
  }

  console.log('📈 SERP trend monitor');
  console.log(`   Latest rows: ${latest.length}`);
  console.log(`   Baseline rows: ${baseline.length}`);
  console.log(`   Anomalies: ${anomalies.length}`);
  console.log(`   Snapshot: ${snapshotPath}`);

  if (anomalies.length > 0) {
    console.log('\n⚠️ Top SERP anomalies:');
    anomalies.slice(0, 20).forEach((anomaly) => {
      console.log(`   - ${anomaly.page}`);
      console.log(`     clicks: ${anomaly.previous.clicks} -> ${anomaly.current.clicks}`);
      console.log(`     ctr: ${anomaly.previous.ctr.toFixed(4)} -> ${anomaly.current.ctr.toFixed(4)}`);
    });
  }

  if (process.argv.includes('--update-baseline')) {
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(latest, null, 2), 'utf8');
    console.log(`\n✅ Baseline updated: ${BASELINE_FILE}`);
  }

  if (FAIL_ON_ANOMALY && anomalies.length > 0) {
    process.exit(1);
  }
}

main();
