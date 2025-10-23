#!/usr/bin/env node
/**
 * PageSpeed Insights Audit Script
 * Fetches performance data from Google PageSpeed Insights API
 * Usage: node scripts/pagespeed-audit.js [url] [mobile|desktop]
 */

const https = require('https');

const url = process.argv[2] || 'https://z-beam.com';
const strategy = process.argv[3] || 'mobile'; // mobile or desktop

const API_KEY = process.env.PAGESPEED_API_KEY || ''; // Optional: Add to .env for higher rate limits
const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}${API_KEY ? `&key=${API_KEY}` : ''}`;

console.log(`\n🔍 Running PageSpeed Insights audit...`);
console.log(`📱 Device: ${strategy}`);
console.log(`🌐 URL: ${url}\n`);

https.get(apiUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (result.error) {
        console.error('❌ Error:', result.error.message);
        process.exit(1);
      }
      
      const lighthouseResult = result.lighthouseResult;
      const categories = lighthouseResult.categories;
      const audits = lighthouseResult.audits;
      
      // Display scores
      console.log('📊 LIGHTHOUSE SCORES:');
      console.log('━'.repeat(50));
      Object.entries(categories).forEach(([key, category]) => {
        const score = Math.round(category.score * 100);
        const emoji = score >= 90 ? '🟢' : score >= 50 ? '🟡' : '🔴';
        console.log(`${emoji} ${category.title}: ${score}/100`);
      });
      
      // Display Core Web Vitals
      console.log('\n⚡ CORE WEB VITALS:');
      console.log('━'.repeat(50));
      const metrics = {
        'largest-contentful-paint': 'LCP (Largest Contentful Paint)',
        'cumulative-layout-shift': 'CLS (Cumulative Layout Shift)',
        'total-blocking-time': 'TBT (Total Blocking Time)',
        'first-contentful-paint': 'FCP (First Contentful Paint)',
        'speed-index': 'Speed Index',
        'interactive': 'TTI (Time to Interactive)',
      };
      
      Object.entries(metrics).forEach(([id, name]) => {
        if (audits[id]) {
          const audit = audits[id];
          const value = audit.displayValue || audit.numericValue;
          const scoreEmoji = audit.score >= 0.9 ? '🟢' : audit.score >= 0.5 ? '🟡' : '🔴';
          console.log(`${scoreEmoji} ${name}: ${value}`);
        }
      });
      
      // Display opportunities (performance improvements)
      console.log('\n🎯 OPPORTUNITIES (Potential Savings):');
      console.log('━'.repeat(50));
      const opportunities = Object.entries(audits)
        .filter(([_, audit]) => audit.score !== null && audit.score < 1 && audit.details?.type === 'opportunity')
        .sort((a, b) => (b[1].numericValue || 0) - (a[1].numericValue || 0))
        .slice(0, 10);
      
      if (opportunities.length === 0) {
        console.log('✨ No major opportunities found!');
      } else {
        opportunities.forEach(([id, audit]) => {
          const savings = audit.displayValue || `${Math.round(audit.numericValue / 1000)}ms`;
          console.log(`\n📌 ${audit.title}`);
          console.log(`   Savings: ${savings}`);
          if (audit.description) {
            console.log(`   ${audit.description.replace(/<[^>]*>/g, '').substring(0, 100)}...`);
          }
        });
      }
      
      // Display diagnostics (issues)
      console.log('\n⚠️  DIAGNOSTICS:');
      console.log('━'.repeat(50));
      const diagnostics = Object.entries(audits)
        .filter(([_, audit]) => audit.score !== null && audit.score < 1 && audit.details?.type === 'table')
        .slice(0, 8);
      
      if (diagnostics.length === 0) {
        console.log('✅ No diagnostics issues found!');
      } else {
        diagnostics.forEach(([id, audit]) => {
          const scoreEmoji = audit.score >= 0.9 ? '🟢' : audit.score >= 0.5 ? '🟡' : '🔴';
          console.log(`${scoreEmoji} ${audit.title}`);
          if (audit.displayValue) {
            console.log(`   ${audit.displayValue}`);
          }
        });
      }
      
      // Display failed audits
      console.log('\n❌ FAILED AUDITS:');
      console.log('━'.repeat(50));
      const failedAudits = Object.entries(audits)
        .filter(([_, audit]) => audit.score === 0)
        .slice(0, 5);
      
      if (failedAudits.length === 0) {
        console.log('✅ No failed audits!');
      } else {
        failedAudits.forEach(([id, audit]) => {
          console.log(`\n🔴 ${audit.title}`);
          if (audit.description) {
            console.log(`   ${audit.description.replace(/<[^>]*>/g, '').substring(0, 150)}...`);
          }
        });
      }
      
      console.log('\n' + '━'.repeat(50));
      console.log(`✅ Audit complete! View full report at:`);
      console.log(`   https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`);
      console.log('━'.repeat(50) + '\n');
      
    } catch (error) {
      console.error('❌ Error parsing results:', error.message);
      process.exit(1);
    }
  });
  
}).on('error', (error) => {
  console.error('❌ Error fetching data:', error.message);
  process.exit(1);
});
