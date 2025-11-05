# PWA Setup Instructions

Your Body Composition Monitor app is now configured as a Progressive Web App (PWA)! Here's how to complete the setup and test it.

## 🎨 Step 1: Generate Icon Assets

The icons now match the favicon design exactly - a clean bar chart with gradient background!

### Required Icon Sizes (Apple & PWA Standard):

- **180x180** - iOS/iPadOS app icon (primary)
- **192x192** - Android minimum
- **512x512** - Android/PWA standard (for splash screens)
- **1024x1024** - iOS App Store/full resolution

### How to Generate:

1. Open `generate-icons.html` in your browser
2. It will auto-generate all 4 required icons
3. Download each icon:
   - `icon-180.png`
   - `icon-192.png`
   - `icon-512.png`
   - `icon-1024.png`
4. Save them to the `/public` directory

**Why these sizes?**

- Apple uses 180x180 for iPhone home screen icons
- 1024x1024 is Apple's full-resolution requirement
- These icons have the gradient background built-in, so iOS won't add any weird background filling
- The rounded corners match iOS design guidelines (20% border radius)

Alternatively, you can use any image editor to export PNG versions of the `icon.svg` file at these sizes.

## 📱 Step 2: Test Installation

### On Desktop (Chrome/Edge):

1. Build the production version: `npm run build`
2. Serve it locally: `npx serve dist` or deploy to your server
3. Open the app in Chrome/Edge
4. After 3 seconds, you should see an install banner appear
5. Click the install button in the browser's address bar (+ icon) or use the banner

### On Mobile (Android):

1. Deploy the app to HTTPS (required for PWA)
2. Visit the site on your Android device
3. After 3 seconds, you'll see a banner at the bottom
4. Tap "Install" to add it to your home screen
5. The app will work like a native app!

### On iOS (iPhone/iPad):

1. Deploy the app to HTTPS
2. Open in Safari
3. Tap the Share button
4. Tap "Add to Home Screen"
5. Confirm to install

**Note:** iOS doesn't support the `beforeinstallprompt` event, so the install banner won't show. Users must manually add it via Safari's Share menu.

## ✅ What's Included

- ✅ Service Worker for offline functionality
- ✅ Web App Manifest with proper metadata
- ✅ Custom install prompt banner (mobile & desktop)
- ✅ Caching strategy (network-first for API, cache-first for assets)
- ✅ Standalone display mode (looks like a native app)
- ✅ Theme colors for browser UI
- ✅ App icons in all required sizes

## 🔧 PWA Requirements

For the install prompt to work:

1. **HTTPS is required** (except on localhost)
2. **Service worker must be registered**
3. **Manifest must be valid**
4. **Icons must be present** (180x180, 192x192, 512x512, 1024x1024 PNG files)
5. **User must visit twice** (with at least 30 seconds between visits on some browsers)
6. **User must have some engagement** (clicks, scrolls, etc.)

**Note:** The icons have rounded corners and gradient backgrounds built-in, perfectly matching iOS guidelines. No transparent backgrounds needed!

## 🧪 Testing Locally

The service worker only registers in production (`npm run build`), not in development mode.

To test locally:

```bash
npm run build
npx serve dist -p 3000
```

Then visit `http://localhost:3000` in your browser.

## 🚀 Deployment Notes

When deploying to Vercel, Netlify, or any static host:

- Ensure all files in `/public` are deployed
- The `sw.js` must be served from the root
- The `manifest.json` must be accessible at `/manifest.json`
- HTTPS is automatically provided by these platforms

## 🎯 Features

Once installed, users get:

- **Home screen icon** - Launch from home screen like a native app
- **Standalone mode** - No browser UI, looks native
- **Offline support** - App works without internet (cached pages)
- **Fast loading** - Assets are cached for instant loads
- **Push notifications** (can be added later if needed)

## 📊 Check PWA Status

In Chrome DevTools:

1. Open DevTools (F12)
2. Go to "Application" tab
3. Check:
   - Manifest - Should show all icons and metadata
   - Service Workers - Should show "activated and running"
   - Storage - Should show cached assets

Use Lighthouse:

1. Open DevTools
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Should score 100/100 for PWA

## 🐛 Troubleshooting

**Install prompt not showing?**

- Clear browser cache and reload
- Check DevTools Console for errors
- Ensure you're on HTTPS (or localhost)
- Try visiting the site twice with 30s gap
- Check Manifest is valid in DevTools > Application

**Service worker not registering?**

- Only works in production build
- Check Console for registration errors
- Ensure `sw.js` is accessible at root

**Icons not showing?**

- Verify PNG files are in `/public` directory
- Check manifest.json has correct paths
- Clear cache and reload

## 🎉 Success!

When everything is working:

- Install banner appears after 3 seconds
- Users can install with one click
- App icon appears on home screen
- App launches in standalone mode
- Works offline with cached content

Enjoy your Progressive Web App! 🚀
