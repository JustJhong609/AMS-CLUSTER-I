# Capacitor App Icon and Splash Assets

Place your source images in this folder, then run asset generation.

## Required (minimum)

- icon-only.png: 1024x1024 px (PNG, transparent background recommended)
- splash.png: 2732x2732 px (PNG)

## Recommended for best Android adaptive icon quality

- icon-foreground.png: 1024x1024 px (PNG, transparent)
- icon-background.png: 1024x1024 px (PNG, solid or gradient background)

## Optional dark mode splash

- splash-dark.png: 2732x2732 px (PNG)

## Splash safe area recommendation

Keep important logo/text inside the center safe area (about 1200x1200 px) so it is not cropped on different screens.

## Generate assets

1. npx capacitor-assets generate --android
2. npx cap sync android

Generated Android assets are written under android/app/src/main/res/.
