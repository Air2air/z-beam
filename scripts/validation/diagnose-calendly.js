#!/usr/bin/env node

/**
 * Debug Calendly widget issues
 * Checks if the event is properly configured and accessible
 */

const https = require('https');

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/z-beam/30min';

console.log('🔍 Calendly Widget Diagnostic\n');
console.log(`URL: ${CALENDLY_URL}\n`);

function checkUrl(url, userAgent = null) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: userAgent ? { 'User-Agent': userAgent } : {}
    };
    
    https.get(url, options, (res) => {
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

async function diagnose() {
  try {
    console.log('📱 Testing with mobile user agent...');
    const mobileResponse = await checkUrl(
      CALENDLY_URL,
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    );
    
    console.log(`   Status: ${mobileResponse.statusCode}`);
    
    // Check for common error messages
    const body = mobileResponse.body.toLowerCase();
    
    if (body.includes('this event type is unavailable') || 
        body.includes('event type is not available')) {
      console.error('\n❌ ISSUE: Event type unavailable');
      console.error('   The event "/30min" does not exist or is deactivated\n');
      console.error('   Fix:');
      console.error('   1. Log into Calendly: https://calendly.com/login');
      console.error('   2. Go to Event Types: https://calendly.com/event_types/user/me');
      console.error('   3. Check if "30min" event exists and is active');
      console.error('   4. If not, create it or update NEXT_PUBLIC_CALENDLY_URL\n');
      return;
    }
    
    if (body.includes('this account has been deactivated') ||
        body.includes('account suspended')) {
      console.error('\n❌ ISSUE: Account deactivated');
      console.error('   The Calendly account "z-beam" is not active\n');
      console.error('   Fix:');
      console.error('   1. Log into Calendly');
      console.error('   2. Check account status');
      console.error('   3. Resolve any billing or subscription issues\n');
      return;
    }
    
    if (body.includes('log in') || body.includes('login')) {
      console.warn('\n⚠️  POSSIBLE ISSUE: Login required');
      console.warn('   The event may be private or require authentication\n');
      console.warn('   Check:');
      console.warn('   1. Event visibility settings (should be Public)');
      console.warn('   2. Event is published (not draft)');
      console.warn('   3. Calendly account is logged in\n');
    }
    
    // Check if it's the user profile page instead of event page
    if (body.includes('welcome to my scheduling page') && 
        !body.includes('calendly-inline-widget')) {
      console.warn('\n⚠️  NOTICE: Profile page loaded, not event page');
      console.warn('   URL points to profile, not specific event');
      console.warn('   This means the event may not exist\n');
      console.warn('   Try:');
      console.warn('   - Create event called "30min" in Calendly');
      console.warn('   - Or update URL to existing event name\n');
    }
    
    // Check embedding permissions
    const xFrameOptions = mobileResponse.headers['x-frame-options'];
    if (xFrameOptions && xFrameOptions.toUpperCase() !== 'ALLOWALL') {
      console.error(`\n❌ EMBEDDING BLOCKED: X-Frame-Options: ${xFrameOptions}`);
      console.error('   Calendly is blocking iframe embeds\n');
    } else {
      console.log('   ✅ Embedding allowed');
    }
    
    console.log('\n📊 Desktop test...');
    const desktopResponse = await checkUrl(CALENDLY_URL);
    console.log(`   Status: ${desktopResponse.statusCode}`);
    
    if (mobileResponse.statusCode === 200 && desktopResponse.statusCode === 200) {
      console.log('\n✅ Calendly URL is accessible on both mobile and desktop');
      console.log('\n💡 If widget shows "logged out" on mobile:');
      console.log('   1. The event may not exist - check Calendly dashboard');
      console.log('   2. Event may be private - make it public');
      console.log('   3. Try using direct Calendly embed script instead of react-calendly');
      console.log('   4. Check browser console for JavaScript errors');
      console.log('\n📚 Next steps:');
      console.log('   • Visit widget on mobile: https://www.z-beam.com/schedule');
      console.log('   • Check browser console for errors (inspect on desktop, remote debug on mobile)');
      console.log('   • Try alternative implementation: ScheduleCalendarDirect.tsx');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

diagnose();
