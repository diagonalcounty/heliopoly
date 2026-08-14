# Heliopoly 1.0.0 — submit checklist

Use with [LISTING.md](./LISTING.md).

## Before Archive

1. Install App Store icons (1024 RGB, no alpha):
   ```bash
   python3 ios/Heliopoly/scripts/install_app_icons.py
   ```
2. From monorepo root: `npm run ios:sync`
3. Open `ios/Heliopoly/Heliopoly.xcodeproj`
4. Scheme **Heliopoly** · destination **Any iOS Device (arm64)**
5. Signing: Team set, bundle `heliopoly.live.Heliopoly`
6. Confirm AppIcon shows rocket-and-sun art in Assets (not the old Ops Manual book)
7. Product → Archive

## Before Submit for Review

1. Deploy privacy page: `public/privacy.html` → https://heliopoly.live/privacy.html  
   (include in normal static deploy of `dist/`; Vite copies `public/`)
2. App Store Connect app record created with same bundle ID
3. Paste listing fields from LISTING.md
4. Upload 1024 icon if Connect asks separately (usually taken from binary)
5. Screenshots for required iPad sizes
6. Age rating questionnaire completed
7. App Privacy: Data Not Collected
8. Export compliance: exempt encryption (matches Info.plist key)
9. Pricing & availability set
10. Build selected on the version page

## After Approve

- Phased release or immediate
- Keep https://heliopoly.live/ as free web companion
- If native telemetry is ever added: update PrivacyInfo + App Privacy + privacy.html first
```