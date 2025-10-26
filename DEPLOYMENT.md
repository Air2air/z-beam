# Z-Beam Deployment Guide

## Overview

This document outlines the deployment process for the Z-Beam laser cleaning solutions website, including production deployments, monitoring, and validation procedures.

## Deployment Architecture

### Vercel Integration

The Z-Beam project uses Vercel for hosting and deployments with the following configuration:

- **Platform**: Vercel (Next.js optimized)
- **Domain**: z-beam.com (production)
- **Preview Domains**: Auto-generated for branch deployments
- **Build Framework**: Next.js 14.2.32
- **Node.js Version**: 18.x

### Environment Configuration

Production deployments use the following environment settings:

```json
{
  "NODE_ENV": "production",
  "NEXT_TELEMETRY_DISABLED": "1",
  "VERCEL_ANALYTICS_ID": "[project-specific]"
}
```

## Deployment Process

### Automatic Deployments

1. **Production Branch**: Pushes to `main` trigger production deployments
2. **Preview Deployments**: Feature branches create preview deployments
3. **Build Validation**: All deployments run comprehensive test suites

### Manual Deployment Commands

```bash
# Deploy to production
git push origin main

# Monitor deployment progress
npm run monitor-deployment

# Deploy specific branch to preview
vercel --prod --scope team-name
```

## Deployment Validation

### Pre-Deployment Checks

The system runs comprehensive validation before deployments:

1. **TypeScript Compilation**: All TypeScript files must compile without errors
2. **Test Suite**: Complete test suite must pass (1400+ tests)
3. **Linting**: ESLint rules must pass
4. **Build Validation**: Next.js build must complete successfully
5. **Performance**: Core Web Vitals validation
6. **Security**: Dependencies scanned for vulnerabilities

### Post-Deployment Validation

After successful deployment:

1. **Health Checks**: Automated endpoint validation
2. **Performance Monitoring**: Core Web Vitals tracking
3. **Error Monitoring**: Real-time error detection
4. **SEO Validation**: Schema.org and metadata verification

## Monitoring and Observability

### Real-Time Monitoring

The project includes comprehensive monitoring tools:

- **Deployment Monitor**: `scripts/deployment/monitor-deployment.js`
- **Error Analysis**: Automated log analysis and categorization
- **Performance Tracking**: Core Web Vitals and loading metrics
- **Uptime Monitoring**: Endpoint availability checks

### Alert Configuration

Alerts are configured for:

- **Build Failures**: Immediate notification on deployment errors
- **Performance Issues**: Core Web Vitals degradation
- **Error Spikes**: Unusual error rate increases
- **Downtime**: Service availability issues

## Rollback Procedures

### Automatic Rollback

- **Failed Health Checks**: Automatic rollback to previous version
- **Critical Errors**: Immediate rollback triggers
- **Performance Degradation**: Rollback on Core Web Vitals failure

### Manual Rollback

```bash
# Rollback to previous deployment
vercel rollback

# Rollback to specific deployment
vercel rollback [deployment-url]
```

## Security Considerations

### Deployment Security

1. **Environment Variables**: Sensitive data managed through Vercel environment variables
2. **HTTPS**: All traffic enforced to HTTPS
3. **Headers**: Security headers configured in `next.config.js`
4. **CORS**: Cross-origin resource sharing properly configured
5. **CSP**: Content Security Policy implementation

### Access Control

- **Team Access**: Controlled through Vercel team permissions
- **Deployment Keys**: Limited to authorized team members
- **Environment Secrets**: Encrypted and access-controlled

## Performance Optimization

### Build Optimization

1. **Bundle Analysis**: Webpack bundle analyzer integration
2. **Image Optimization**: Next.js Image component with Vercel optimization
3. **Code Splitting**: Automatic route-based code splitting
4. **Static Generation**: ISR (Incremental Static Regeneration) where appropriate

### Runtime Performance

- **CDN**: Global CDN distribution through Vercel Edge Network
- **Caching**: Intelligent caching strategies
- **Compression**: Automatic gzip/brotli compression
- **Service Workers**: PWA features for offline functionality

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   - Check TypeScript compilation errors
   - Verify all dependencies are installed
   - Validate environment variables

2. **Performance Issues**
   - Analyze bundle size
   - Check for memory leaks
   - Validate Core Web Vitals

3. **Runtime Errors**
   - Check deployment logs
   - Verify API endpoints
   - Validate client-side error boundaries

### Debug Commands

```bash
# Inspect deployment
vercel inspect [deployment-url]

# View deployment logs
vercel logs [deployment-url]

# Run local build
npm run build

# Analyze bundle
npm run analyze
```

## Related Documentation

- [Smart Deploy System](./docs/deployment/SMART_DEPLOY_SYSTEM.md)
- [Production Only Policy](./docs/deployment/PRODUCTION_ONLY_POLICY.md)
- [Deployment Monitoring Guide](./docs/deployment/deployment-monitoring-guide.md)
- [Build Configuration](./docs/development/build-configuration.md)

## Support and Contacts

For deployment issues:

1. **Check Status**: [Vercel Status Page](https://status.vercel.com)
2. **Team Channel**: Internal Slack #deployment-alerts
3. **Documentation**: This guide and related docs
4. **Escalation**: Senior developer on-call rotation
