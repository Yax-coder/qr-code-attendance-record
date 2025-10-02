# 🚀 Netlify Deployment Guide

This guide will help you deploy your attendance demo app to Netlify with both frontend and backend functionality.

## 📋 Prerequisites

1. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository** - Push your code to GitHub
3. **Node.js 20+** - For local development

## 🔧 Setup Steps

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub with these files:
- `netlify.toml` (configuration)
- `netlify/functions/` (serverless functions)
- Updated `src/services/api.js` (production-ready API calls)

### 2. Deploy to Netlify

#### Option A: Connect GitHub Repository (Recommended)

1. **Go to Netlify Dashboard**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"

2. **Connect GitHub**
   - Choose "GitHub" as your Git provider
   - Authorize Netlify to access your repositories
   - Select your `attendance-demo` repository

3. **Configure Build Settings**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** `20`

4. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete (usually 2-3 minutes)

#### Option B: Manual Deploy

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Drag and drop** the `dist` folder to Netlify dashboard

### 3. Configure Environment Variables (Optional)

If you need environment variables:
1. Go to **Site settings** → **Environment variables**
2. Add any required variables

## 🌐 Your Live URLs

After deployment, you'll get:
- **Frontend:** `https://your-site-name.netlify.app`
- **API Endpoints:**
  - `https://your-site-name.netlify.app/api/users`
  - `https://your-site-name.netlify.app/api/attendance`
  - `https://your-site-name.netlify.app/api/sessions`

## 🔄 Continuous Deployment

Once connected to GitHub:
- **Automatic deploys** on every push to main branch
- **Preview deploys** for pull requests
- **Rollback** to previous deployments if needed

## 🛠️ Local Development

To test locally with the same setup as production:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development server
netlify dev
```

This will run both frontend and functions locally.

## 📊 Monitoring

Monitor your deployment:
- **Build logs** in Netlify dashboard
- **Function logs** in Functions tab
- **Analytics** for usage statistics

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check Node.js version (should be 20+)
   - Verify all dependencies are in `package.json`
   - Check build logs for specific errors

2. **Functions Not Working**
   - Ensure `netlify/functions/` directory exists
   - Check function syntax (ES modules)
   - Verify CORS headers are set

3. **API Calls Failing**
   - Check browser network tab
   - Verify API endpoints are correct
   - Ensure CORS is properly configured

### Getting Help:

- **Netlify Docs:** [docs.netlify.com](https://docs.netlify.com)
- **Community:** [community.netlify.com](https://community.netlify.com)
- **Support:** Available in Netlify dashboard

## 🎉 Success!

Once deployed, your attendance demo will be live and accessible worldwide with:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless backend
- ✅ Continuous deployment
- ✅ Free hosting (with limits)

Your app is now production-ready! 🚀
