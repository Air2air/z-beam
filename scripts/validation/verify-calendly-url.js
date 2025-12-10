#!/usr/bin/env node

/**
 * Verify Calendly URL is accessible and working
 * Used in pre-deployment checks
 */

const https = require('https');

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/z-beam/30min';

console.log('🔍 Verifying Calendly URL...');
console.log(`   URL: ${CALENDLY_URL}\n`);

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function verifyCalendlyUrl() {
  try {
    // Check if URL is in correct format
    if (!CALENDLY_URL.startsWith('https://calendly.com/')) {
      console.error('❌ ERROR: Calendly URL must start with https://calendly.com/');
      console.error(`   Got: ${CALENDLY_URL}`);
      process.exit(1);
    }

    // Test URL accessibility
    const response = await checkUrl(CALENDLY_URL);
    
    if (response.statusCode === 200) {
      console.log('✅ Calendly URL is accessible');
      console.log(`   Status: ${response.statusCode}`);
      
      // Check for common error indicators in the response
      const body = response.body.toLowerCase();
      
      if (body.includes('this page is not available') || 
          body.includes('page not found') ||
          body.includes('404')) {
        console.error('⚠️  WARNING: Calendly page may not exist');
        console.error('   The URL loads but shows "page not available"');
        console.error('   Please verify the event exists in your Calendly dashboard');
        process.exit(1);
      }
      
      if (body.includes('log in to schedule') || 
          body.includes('account suspended') ||
          body.includes('unauthorized')) {
        console.error('⚠️  WARNING: Calendly event may be private or account has issues');
        console.error('   Please check:');
        console.error('   1. Event is published and public');
        console.error('   2. Calendly account is active');
        console.error('   3. No subscription/payment issues');
        process.exit(1);
      }
      
      // Check if it's a profile page (should redirect to event page)
      if (body.includes('welcome to my scheduling page') && 
          !body.includes('event-type')) {
        console.error('⚠️  WARNING: URL points to profile page, not specific event');
        console.error('   You may need to update URL to specific event type');
        console.error('   Example: https://calendly.com/z-beam/consultation');
        process.exit(1);
      }
      
      console.log('✅ Calendly event appears to be properly configured');
      console.log('\n📊 Validation Summary:');
      console.log('   • URL is accessible');
      console.log('   • No error pages detected');
      console.log('   • Event appears public and active');
      console.log('\n✨ Calendly validation passed!\n');
      process.exit(0);
      
    } else if (response.statusCode === 301 || response.statusCode === 302) {
      console.log(`⚠️  Redirect detected (${response.statusCode})`);
      console.log(`   Location: ${response.headers.location}`);
      console.log('   This may be normal, checking redirect target...\n');
      
      // Follow redirect
      const redirectResponse = await checkUrl(response.headers.location);
      if (redirectResponse.statusCode === 200) {
        console.log('✅ Redirect target is accessible');
        console.log('✨ Calendly validation passed!\n');
        process.exit(0);
      } else {
        console.error(`❌ Redirect target returned ${redirectResponse.statusCode}`);
        process.exit(1);
      }
      
    } else {
      console.error(`❌ ERROR: Calendly URL returned status ${response.statusCode}`);
      console.error('   Expected: 200 (OK)');
      console.error('\n   Possible causes:');
      console.error('   • Event does not exist or was deleted');
      console.error('   • Event slug is misspelled in URL');
      console.error('   • Calendly account has issues');
      console.error('\n   Fix:');
      console.error('   1. Log into Calendly: https://calendly.com/login');
      console.error('   2. Check Event Types: https://calendly.com/event_types/user/me');
      console.error('   3. Verify event exists and copy correct URL');
      console.error('   4. Update NEXT_PUBLIC_CALENDLY_URL in Vercel');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ ERROR: Failed to connect to Calendly');
    console.error(`   ${error.message}`);
    console.error('\n   Possible causes:');
    console.error('   • Network connectivity issues');
    console.error('   • Calendly service is down');
    console.error('   • Invalid URL format');
    process.exit(1);
  }
}

// Run verification
verifyCalendlyUrl();
