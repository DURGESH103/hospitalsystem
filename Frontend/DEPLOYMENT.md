# Deployment Guide

## Production Build

### 1. Environment Setup

Create `.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### 2. Build Command
```bash
npm run build
```

Output: `dist/` folder with optimized static assets

### 3. Build Optimization
- Minified JavaScript and CSS
- Tree-shaking for unused code
- Code splitting for lazy-loaded routes
- Optimized images and assets
- Gzip compression

## Deployment Platforms

### Vercel (Recommended)

**Why Vercel?**
- Zero configuration
- Automatic HTTPS
- Global CDN
- Instant rollbacks
- Preview deployments

**Steps**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### Netlify

**Steps**:
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy

**Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### AWS Amplify

**Steps**:
1. Connect repository
2. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Environment variables: Add from `.env.production`
4. Deploy

**Configuration** (`amplify.yml`):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

### Azure Static Web Apps

**Steps**:
1. Create Static Web App resource
2. Connect GitHub repository
3. Configure build:
   - App location: `/`
   - Output location: `dist`
4. Deploy

---

### Docker Deployment

**Dockerfile**:
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Build and Run**:
```bash
docker build -t smart-hospital-frontend .
docker run -p 80:80 smart-hospital-frontend
```

---

## CI/CD Pipeline

### GitHub Actions

**`.github/workflows/deploy.yml`**:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          VITE_WS_URL: ${{ secrets.WS_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Performance Optimization

### 1. Code Splitting
```javascript
// Lazy load routes
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard'));

<Suspense fallback={<Loading />}>
  <AdminDashboard />
</Suspense>
```

### 2. Asset Optimization
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          animations: ['framer-motion'],
        },
      },
    },
  },
};
```

### 3. Image Optimization
- Use WebP format
- Lazy load images
- Responsive images with srcset
- CDN for static assets

### 4. Bundle Analysis
```bash
npm install -D rollup-plugin-visualizer

# Add to vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [visualizer()],
};
```

---

## Monitoring & Analytics

### 1. Error Tracking (Sentry)
```bash
npm install @sentry/react
```

```javascript
// main.jsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### 2. Performance Monitoring
```javascript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 3. Analytics (Google Analytics)
```bash
npm install react-ga4
```

```javascript
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');
ReactGA.send('pageview');
```

---

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured
- [ ] API keys not exposed in client code
- [ ] Content Security Policy (CSP) headers
- [ ] CORS configured properly
- [ ] XSS protection enabled
- [ ] Secure WebSocket (WSS) in production
- [ ] Rate limiting on API endpoints
- [ ] Input validation and sanitization
- [ ] Regular dependency updates

---

## Environment Variables

### Development
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### Staging
```env
VITE_API_URL=https://staging-api.yourdomain.com
VITE_WS_URL=wss://staging-api.yourdomain.com
```

### Production
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

---

## CDN Configuration

### Cloudflare
1. Add site to Cloudflare
2. Update DNS records
3. Enable:
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - HTTP/3
   - Rocket Loader
4. Configure caching rules

### AWS CloudFront
1. Create distribution
2. Origin: S3 bucket or custom origin
3. Enable compression
4. Configure cache behaviors
5. Add SSL certificate

---

## Health Checks

### Endpoint
```javascript
// public/health.json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Monitoring
```bash
# Uptime monitoring
curl https://yourdomain.com/health.json
```

---

## Rollback Strategy

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Manual Rollback
1. Keep previous build artifacts
2. Redeploy previous version
3. Update environment variables if needed

---

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication flow
- [ ] Check WebSocket connection
- [ ] Verify real-time updates
- [ ] Test all user roles (patient, doctor, admin)
- [ ] Check responsive design on mobile
- [ ] Verify dark mode works
- [ ] Test error handling
- [ ] Check analytics tracking
- [ ] Monitor error logs
- [ ] Verify SSL certificate
- [ ] Test performance (Lighthouse)
- [ ] Check SEO meta tags

---

## Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### WebSocket Connection Issues
- Verify WSS protocol in production
- Check CORS configuration
- Verify SSL certificate
- Check firewall rules

### Performance Issues
- Run Lighthouse audit
- Check bundle size
- Analyze network requests
- Enable compression
- Use CDN for static assets

---

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review error logs weekly
- Monitor performance metrics
- Backup environment variables
- Test disaster recovery plan

### Dependency Updates
```bash
# Check outdated packages
npm outdated

# Update dependencies
npm update

# Update major versions
npm install package@latest
```

---

## Support

For deployment issues:
1. Check deployment logs
2. Verify environment variables
3. Test locally with production build
4. Contact platform support
5. Review documentation

---

## Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [AWS Amplify Documentation](https://docs.amplify.aws)
