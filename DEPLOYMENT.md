# SEVERA DEFENDER AI — PRODUCTION DEPLOYMENT GUIDE

This guide provides step-by-step instructions for deploying **Severa Defender AI** to production hosting platforms.

---

## 1. Quick Vercel Deployment (Recommended)

Severa Defender AI is pre-configured for instant one-click deployment on Vercel.

### Steps:
1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Log into [Vercel Dashboard](https://vercel.com).
3. Click **"Add New" -> "Project"** and import your repository.
4. Set Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Configure Environment Variables in Vercel:
   - `VITE_SUPABASE_URL`: `https://rmwbfximqdtfuhzuvslf.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_Ts0kIOCszVEEw9YARdq2tA_wQY05miM`
6. Click **Deploy**. Vercel will build and serve the app over Global CDN with SSL enabled.

---

## 2. Netlify Deployment

1. Log into [Netlify](https://netlify.com).
2. Select **"Add new site" -> "Import an existing project"**.
3. Set Settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables under **Site Settings -> Environment Variables**.
5. Click **Deploy Site**.

---

## 3. Docker Deployment

To serve Severa Defender AI using Nginx inside a Docker container:

### `Dockerfile`:
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
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build & Run Commands:
```bash
docker build -t severa-defender-ai .
docker run -d -p 80:80 severa-defender-ai
```

---

## 4. Local / Self-Hosted Production Test

To preview the production bundle locally:

```bash
npm run build
npm run preview
```

App will be available at `http://localhost:4173`.
