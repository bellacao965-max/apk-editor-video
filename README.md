# Editor Ultimate

Contains:
- Image editor with Green Screen (Chroma Key), Face Tracking (MediaPipe), Body Slim (segmentation warp)
- Sticker packs and drag/drag handling
- Video filters via ffmpeg.wasm
- AI Avatar Generator (client-side posterize). For production-grade avatars, use a server (StyleGAN / Stable Diffusion).

## Run locally
1. npm install
2. npm run dev

## Android (APK) template
We include an Expo React Native template under /android-expo. To build APK:
- Install Expo CLI (`npm install -g expo-cli`) or use EAS.
- cd android-expo
- expo build:android   (or use `eas build -p android` for managed builds)

Note: Building APK is not performed here. The template provides structure to run and build on your machine or CI.

## Notes
- Some models (TensorFlow) load from web and may take time.
- For heavy processing (large videos, high-res image transforms), prefer server-side processing.

