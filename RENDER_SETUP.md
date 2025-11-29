# Render Deployment Setup

This guide will help you deploy your SignalR Checkers app to Render for **FREE**.

## Prerequisites
- A GitHub account
- A Render account (sign up at https://render.com - FREE)

## Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account (recommended for easier integration)

## Step 2: Create Web Service on Render

### Option A: Deploy via Render Dashboard (Easiest)
1. Log in to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `socr4tesjohnson/Checkerssignalr`
4. Configure the service:
   - **Name**: `checkers-signalr` (or your preferred name)
   - **Region**: Choose closest to you (e.g., Oregon)
   - **Branch**: `main`
   - **Runtime**: **Docker**
   - **Plan**: **Free**
5. Click **"Create Web Service"**
6. Render will automatically detect the `render.yaml` and `Dockerfile`

### Option B: Deploy via GitHub Actions (Auto-deploy on push)

#### Get Your Render Credentials

1. **Get API Key**:
   - Go to https://dashboard.render.com/account/settings
   - Scroll to **API Keys**
   - Click **"Create API Key"**
   - Copy the key (you won't see it again!)

2. **Get Service ID**:
   - After creating the web service in Render dashboard
   - Go to your service page
   - The URL will look like: `https://dashboard.render.com/web/srv-xxxxxxxxxxxxx`
   - Copy the `srv-xxxxxxxxxxxxx` part - this is your Service ID

#### Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add these two secrets:

   | Name | Value |
   |------|-------|
   | `RENDER_API_KEY` | Your Render API key from step 1 |
   | `RENDER_SERVICE_ID` | Your service ID (srv-xxxxx) from step 2 |

## Step 3: Deploy

### Manual Deploy (Option A)
- Render will automatically deploy when you create the service
- Or click **"Manual Deploy"** → **"Deploy latest commit"** in your Render dashboard

### Auto Deploy via GitHub (Option B)
- Push to the `main` branch
- GitHub Actions will automatically build and deploy to Render
- Check the **Actions** tab in GitHub to see deployment progress

## Step 4: Access Your App

1. Once deployed, Render will give you a URL like:
   - `https://checkers-signalr.onrender.com`
2. Your app is now live! 🎉

## Important Notes

### Free Tier Limitations
- ⏰ **Sleeps after 15 minutes** of inactivity
- ⏱️ **Wakes up in ~30 seconds** when accessed
- 🔌 **WebSocket connections drop** during sleep
- ✅ SignalR clients auto-reconnect when server wakes up

### What This Means for Your Game
- During active play: Works perfectly
- After 15 min idle: Players disconnected, game state lost
- Good for: Demo, testing, low-traffic apps
- Not ideal for: 24/7 availability

### Upgrading (Optional)
If you need always-on service:
- Upgrade to **Starter plan** ($7/month)
- No sleep, persistent connections
- Go to your service → **Settings** → **Plan** → Upgrade

## Monitoring

View logs in Render dashboard:
1. Go to your service
2. Click **"Logs"** tab
3. See real-time application logs

## Troubleshooting

### Service won't start
- Check logs in Render dashboard
- Verify Dockerfile builds locally: `docker build -t checkers .`

### GitHub Actions deployment fails
- Verify secrets are set correctly in GitHub
- Check Actions tab for error details
- Ensure Service ID starts with `srv-`

### App loads but no SignalR connection
- Check browser console for errors
- Verify CORS settings if needed
- Check Render logs for connection errors

## Cost Breakdown

| Tier | Cost | Sleep | Use Case |
|------|------|-------|----------|
| **Free** | $0 | After 15min | Demo, testing |
| **Starter** | $7/mo | Never | Production |

## Need Help?

- Render docs: https://render.com/docs
- Render community: https://community.render.com
- Check your service logs in dashboard
