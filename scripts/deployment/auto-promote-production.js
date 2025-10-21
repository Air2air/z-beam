#!/usr/bin/env node

/**
 * Auto-promote main branch deployments to production
 * This script runs after a successful deployment and promotes it to production
 * if it was deployed from the main branch.
 */

const { execSync } = require('child_process');

async function autoPromoteToProduction() {
  try {
    console.log('🔍 Checking latest deployment...');
    
    // Get the latest deployment
    const deploymentsOutput = execSync('vercel ls --json', { encoding: 'utf8' });
    const deployments = JSON.parse(deploymentsOutput);
    
    if (!deployments.deployments || deployments.deployments.length === 0) {
      console.log('❌ No deployments found');
      return;
    }
    
    const latestDeployment = deployments.deployments[0];
    console.log(`📊 Latest deployment: ${latestDeployment.url}`);
    console.log(`📋 State: ${latestDeployment.readyState || latestDeployment.state}`);
    console.log(`🎯 Target: ${latestDeployment.target || 'preview'}`);
    
    // Check if it's a preview deployment that's ready
    const isPreview = (latestDeployment.target || 'preview') === 'preview';
    const isReady = (latestDeployment.readyState || latestDeployment.state) === 'READY';
    
    if (isPreview && isReady) {
      console.log('🚀 Promoting preview deployment to production...');
      
      // Promote to production using the deployment URL
      const promoteCmd = `vercel promote https://${latestDeployment.url} --yes`;
      console.log(`Running: ${promoteCmd}`);
      
      const promoteOutput = execSync(promoteCmd, { encoding: 'utf8' });
      console.log('✅ Successfully promoted to production!');
      console.log(promoteOutput);
      
      return true;
    } else if (latestDeployment.target === 'production') {
      console.log('✅ Latest deployment is already in production');
      return true;
    } else {
      console.log(`⏳ Deployment not ready for promotion (State: ${latestDeployment.readyState || latestDeployment.state})`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error promoting deployment:', error.message);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  autoPromoteToProduction()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

module.exports = { autoPromoteToProduction };