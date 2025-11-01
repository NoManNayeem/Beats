# Building and Releasing Beats App

This guide explains how to build and release the Beats app for Android and iOS using GitHub Actions and EAS Build.

## 📋 Prerequisites

1. **Expo Account**: Sign up at [expo.dev](https://expo.dev)
2. **EAS CLI**: `npm install -g eas-cli`
3. **GitHub Secrets**: Configure required secrets in repository settings

## 🔐 Required GitHub Secrets

Add these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Essential Secrets
- `EXPO_TOKEN` - Your Expo access token
  - Get it from: [expo.dev/accounts/[account]/settings/access-tokens](https://expo.dev/accounts/[account]/settings/access-tokens)
  - Click "Create Token" with "Full Access" scope

### Android (Optional, for signed builds)
- `ANDROID_KEYSTORE_BASE64` - Base64 encoded keystore file
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_ALIAS` - Key alias
- `ANDROID_KEY_PASSWORD` - Key password

### iOS (Optional, for App Store submission)
- `APPLE_ID` - Your Apple ID email
- `APPLE_APP_SPECIFIC_PASSWORD` - App-specific password
  - Create at: [appleid.apple.com/account/manage](https://appleid.apple.com/account/manage)
  - Security > App-Specific Passwords
- `APPLE_TEAM_ID` - Your Apple Developer Team ID

## 🚀 How to Build and Release

### Method 1: Automatic Release on Tag Push

1. **Create a version tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub Actions will automatically:**
   - Build Android APK
   - Build iOS IPA
   - Create a GitHub Release with both builds

### Method 2: Manual Build via GitHub Actions

1. Go to **Actions** tab in your GitHub repository
2. Select **"Build and Release App"** workflow
3. Click **"Run workflow"**
4. Choose:
   - **Platform**: `android`, `ios`, or `both`
   - **Version**: Optional version tag (e.g., `v1.0.0`)
5. Click **"Run workflow"**

### Method 3: Using EAS Build Directly

```bash
cd beats

# Configure EAS (first time only)
eas build:configure

# Build Android
eas build --platform android --profile production

# Build iOS
eas build --platform ios --profile production

# Build both
eas build --platform all --profile production
```

## 📱 Build Profiles

### Development
- For testing and development
- Includes development client
- Android: APK
- iOS: Simulator build

```bash
eas build --platform android --profile development
```

### Preview
- Internal distribution
- Android: APK
- iOS: IPA for TestFlight or ad-hoc distribution

```bash
eas build --platform android --profile preview
```

### Production
- Store-ready builds
- Android: AAB (App Bundle) or APK
- iOS: IPA for App Store

```bash
eas build --platform android --profile production
```

## 📥 Downloading Builds

### From GitHub Releases
1. Go to your repository
2. Click **Releases**
3. Download APK/IPA from the latest release

### From EAS Build Dashboard
1. Visit [expo.dev/accounts/[account]/builds](https://expo.dev/accounts/[account]/builds)
2. Find your build
3. Click **Download**

## 🔄 Release Process

### Step 1: Update Version
```bash
# Update version in app.json
cd beats
# Edit app.json: "version": "1.0.0"
```

### Step 2: Commit and Tag
```bash
git add beats/app.json
git commit -m "Release v1.0.0"
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

### Step 3: Monitor Build
- Check GitHub Actions tab for build progress
- EAS builds take ~15-30 minutes

### Step 4: Release Created
- GitHub Release automatically created
- Download links available in release page

## 📦 Distribution

### Android APK
- Direct installation on Android devices
- Users need to enable "Install from Unknown Sources"
- Or distribute via Google Play Store

### iOS IPA
- Requires device registration for ad-hoc distribution
- Or distribute via TestFlight
- Or submit to App Store

## 🛠️ Troubleshooting

### Build Fails
1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Check EAS Build dashboard for detailed errors

### Missing Secrets
- Ensure all required secrets are added
- `EXPO_TOKEN` is mandatory for all builds

### iOS Build Issues
- Verify Apple Developer account is active
- Check certificates and provisioning profiles in EAS

## 📚 Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo App Configuration](https://docs.expo.dev/workflow/configuration/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Note**: First-time builds may take longer as EAS sets up build infrastructure. Subsequent builds are faster due to caching.

