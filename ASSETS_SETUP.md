# Assets Setup Instructions

## Logo Image

1. **Place your logo file here:**
   ```
   src/renderer/assets/logo.png
   ```

2. **Supported formats:** `.png`, `.jpg`, `.svg`

3. **Recommended size:** 512x512px or larger (will be scaled automatically)

The logo will automatically appear in:
- HomeView (large, centered)
- Sidebar header (medium size)

## App Icon

1. **Place your icon file(s) here:**
   ```
   assets/icon.png        (for all platforms - fallback)
   assets/icon.ico         (for Windows - optional, will use .png if not found)
   assets/icon.icns        (for macOS - optional, will use .png if not found)
   ```

2. **Recommended sizes:**
   - Windows (.ico): 256x256px
   - macOS (.icns): 512x512px  
   - Linux/fallback (.png): 512x512px

3. **The app will automatically:**
   - Use `.ico` on Windows if available, otherwise `.png`
   - Use `.icns` on macOS if available, otherwise `.png`
   - Use `.png` on Linux

## File Structure

```
mikayla-fun-app/
├── assets/                    ← App icons go here (root level)
│   ├── icon.ico              (Windows - optional)
│   ├── icon.icns             (macOS - optional)
│   └── icon.png              (Fallback for all platforms)
│
└── src/
    └── renderer/
        └── assets/           ← Logo image goes here
            └── logo.png      (Your logo image)
```

## Notes

- The logo path uses Vite's asset handling, so it will work in both development and production
- If the logo file doesn't exist, the component will gracefully hide (no errors)
- If the icon file doesn't exist, the app will use Electron's default icon (no errors)

