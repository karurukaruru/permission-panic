# Permission Panic launch kit

The campaign posters use an original rendered Allow key as an editorial metaphor.
They are concept artwork, not game screenshots. The card images and gameplay
video separately show the actual app. No star counts, user numbers, security
guarantees or endorsements are claimed.

| Asset                | Format                         | Use                                              |
| -------------------- | ------------------------------ | ------------------------------------------------ |
| `launch.png`         | 1200 × 630                     | X / Reddit link post, GitHub social preview      |
| `twist.png`          | 1280 × 720                     | Video thumbnail, incident hook                   |
| `square.png`         | 1080 × 1080                    | Square social post                               |
| `gameplay.mp4`       | 1100 × 1100, 12 seconds, H.264 | Actual playthrough edit; silent / captions in UI |
| `gameplay.gif`       | 620 × 620, 12 seconds          | GitHub / community preview                       |
| `test-request.png`   | Actual card screenshot         | Clean permission prompt                          |
| `incident-card.png`  | Actual card screenshot         | Simulated credential incident                    |
| `inspect-card.png`   | Actual card screenshot         | Plain-language inspection branch                 |
| `actual-results.png` | Actual card screenshot         | The recorded run: 800/1000, 90% accuracy         |
| `launch-copy.md`     | English and Chinese text       | X / Reddit / Bilibili drafts                     |

The clip approves round 1, incorrectly approves round 2, then cuts to the actual
result after completing the remaining eight rounds correctly. It is edited real
gameplay, not an uninterrupted full campaign. All in-game incidents are simulated.

## Reproduce

```sh
npm run build
npx playwright install chromium
node scripts/capture-promo.mjs
node scripts/render-marketing.mjs
```

The capture writes numbered frames to `/tmp/permission-panic-promo-frames` by
default. Set `PROMO_FRAME_DIR` to change it. Set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` only if using a custom Chromium installation.
Use FFmpeg to encode the frames at 8 fps and export an H.264 MP4 or optimized GIF.

Launch artwork source: `launch.html`; image-generation brief: `art-direction.md`.
The transparent key artwork is `permission-key.png`, made with the built-in
image-generation tool. It uses local images and fonts already
available on the rendering machine. No external image or font requests are needed.

Add the verified public repository or demo URL to the post drafts before posting.
These are prepared promotional materials; no social posts have been sent.
