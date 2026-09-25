# OpenDyslexic Font Files

## Download Instructions

The OpenDyslexic font is **not included in this repository** due to licensing requirements. You must download it separately.

### Quick Download

1. **Visit:** https://opendyslexic.org/
2. **Download:** Latest version (v2.001 or newer)
3. **Extract:** The web fonts (woff2 and woff formats)
4. **Place here:** Copy the following files to this directory:

```
public/fonts/opendyslexic/
├── OpenDyslexic-Regular.woff2
├── OpenDyslexic-Regular.woff
├── OpenDyslexic-Bold.woff2
├── OpenDyslexic-Bold.woff
├── OpenDyslexic-Italic.woff2
├── OpenDyslexic-Italic.woff
├── OpenDyslexic-BoldItalic.woff2
├── OpenDyslexic-BoldItalic.woff
└── LICENSE.txt (from the download)
```

### Alternative: Direct GitHub Download

```bash
# Download from GitHub releases
curl -L https://github.com/antijingoist/opendyslexic/releases/download/v2.001/opendyslexic-0.91.12-web.zip -o opendyslexic.zip

# Extract
unzip opendyslexic.zip -d public/fonts/opendyslexic/

# Clean up
rm opendyslexic.zip
```

## License Information

**License:** SIL Open Font License (OFL) + Bitstream Vera License  
**Commercial Use:** ✅ Allowed  
**Modification:** ✅ Allowed  
**Redistribution:** ✅ Allowed with attribution  
**Cost:** Free  

### Attribution Requirements

You must include attribution in:
1. This LICENSE.txt file (alongside fonts)
2. Website footer (already implemented)
3. About page (already planned)

**Attribution Text:**
```
OpenDyslexic font by Abelardo Gonzalez
Licensed under Creative Commons Attribution 3.0 Unported License
https://opendyslexic.org/
```

## Verification

After downloading, verify you have these files:

```bash
ls -la public/fonts/opendyslexic/
```

You should see 8 font files (.woff2 and .woff) plus LICENSE.txt.

## Fallback Behavior

If fonts are not downloaded:
- The dyslexia font toggle will still appear
- It will gracefully fall back to Arial/sans-serif
- No errors will be shown to users
- Console will show: "OpenDyslexic font files not found"

## Testing

After downloading fonts:

1. Visit: http://localhost:3000/demo/accessibility-test
2. Open accessibility panel
3. Enable "Dyslexia-Friendly Font" toggle
4. Text should change to OpenDyslexic font
5. Check browser console for any loading errors

## Resources

- **Official Website:** https://opendyslexic.org/
- **GitHub Repository:** https://github.com/antijingoist/opendyslexic
- **License Details:** https://scripts.sil.org/OFL
- **Integration Guide:** `/docs/in-progress/accessibility-feature/opendyslexic-integration.md`

---

**Status:** ⏳ Fonts not yet downloaded - follow instructions above
