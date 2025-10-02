#!/usr/bin/env node

/**
 * DEPLOYMENT NOTIFICATION SYSTEM
 * ===============================
 * Sends desktop notifications for deployment status
 * Works on macOS, Linux, and Windows
 */

const { exec } = require('child_process');
const os = require('os');

function sendNotification(title, message, sound = true) {
  const platform = os.platform();
  
  let command = '';
  
  switch (platform) {
    case 'darwin': // macOS
      // Use osascript for native notifications
      const soundArg = sound ? 'with sound name "Glass"' : '';
      command = `osascript -e 'display notification "${message}" with title "${title}" ${soundArg}'`;
      break;
      
    case 'linux':
      // Use notify-send if available
      command = `which notify-send > /dev/null && notify-send "${title}" "${message}"`;
      break;
      
    case 'win32': // Windows
      // Use PowerShell for Windows notifications
      const psCommand = `
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.UI.Notifications.ToastNotification, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
        $template = @"
        <toast>
          <visual>
            <binding template="ToastText02">
              <text id="1">${title}</text>
              <text id="2">${message}</text>
            </binding>
          </visual>
        </toast>
"@
        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml($template)
        $toast = New-Object Windows.UI.Notifications.ToastNotification $xml
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Vercel Deploy").Show($toast)
      `.replace(/\n/g, '; ');
      command = `powershell -Command "${psCommand}"`;
      break;
      
    default:
      // Fallback to console
      console.log(`\n🔔 ${title}\n   ${message}\n`);
      return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    exec(command, (error) => {
      if (error) {
        // Silently fail - notifications are optional
        console.log(`\n🔔 ${title}\n   ${message}\n`);
      }
      resolve();
    });
  });
}

function notifySuccess(url, duration) {
  const durationText = duration ? ` (${duration})` : '';
  return sendNotification(
    '✅ Deployment Successful',
    `Site is live at ${url}${durationText}`,
    true
  );
}

function notifyFailure(url, errorType) {
  const errorText = errorType ? `: ${errorType}` : '';
  return sendNotification(
    '❌ Deployment Failed',
    `Build error${errorText}. Check logs for details.`,
    true
  );
}

function notifyProgress(status) {
  return sendNotification(
    '🔨 Deployment in Progress',
    `Status: ${status}`,
    false
  );
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const type = args[0];
  
  if (!type || args.includes('--help')) {
    console.log(`
Deployment Notification System

Usage:
  node notify.js <type> [options]

Types:
  success <url> [duration]  - Deployment succeeded
  failure <url> [error]     - Deployment failed
  progress <status>         - Deployment in progress

Examples:
  node notify.js success "z-beam-abc.vercel.app" "2m 15s"
  node notify.js failure "z-beam-abc.vercel.app" "Build error"
  node notify.js progress "Building"
    `);
    process.exit(0);
  }
  
  switch (type) {
    case 'success':
      notifySuccess(args[1] || 'deployment', args[2]);
      break;
    case 'failure':
      notifyFailure(args[1] || 'deployment', args[2]);
      break;
    case 'progress':
      notifyProgress(args[1] || 'Building');
      break;
    default:
      console.error(`Unknown notification type: ${type}`);
      process.exit(1);
  }
}

module.exports = {
  sendNotification,
  notifySuccess,
  notifyFailure,
  notifyProgress,
};
