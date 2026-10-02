---
title: "How to Batch Crop Concert Photos for Instagram (Without Losing Your Evening)"
description: "Cropping 60 concert photos to 4:5, 1:1 and 9:16 by hand is the worst part of delivery day. Here's the fast workflow in Lightroom and Photoshop."
date: "2026-09-20"
category: "Workflow"
tags: ["photoshop", "lightroom", "instagram", "workflow", "batch editing"]
affiliate: false
draft: false
---

You've delivered the client gallery. Now the artist's management asks for "the best ones for Instagram" — which means re-cropping your carefully composed 3:2 frames to 4:5 for the feed, 1:1 for the grid preview, and 9:16 for Stories. For sixty photos. Each in three versions.

This used to eat my evenings after every show. Here's how to make it a ten-minute job.

## Know your target sizes first

| Placement | Ratio | Pixels |
|---|---|---|
| Feed portrait | 4:5 | 1080 × 1350 |
| Feed square | 1:1 | 1080 × 1080 |
| Stories / Reels | 9:16 | 1080 × 1920 |

Two rules from delivering to artist socials for years: **4:5 is the money crop** (it takes the most screen space in the feed), and **crop for the face, not the frame** — your beautiful negative space dies on a phone screen.

## The Lightroom way (fine for a handful)

Lightroom can sync crop *ratios* but not intelligent crop *positions*: Sync Crop applies the same rectangle to every photo, which beheads half your subjects. The realistic Lightroom workflow:

1. Select your Instagram picks, set the aspect ratio on the first (press `R`, choose 4:5)
2. Sync the ratio to the rest
3. Walk through every single photo re-positioning the crop by hand
4. Repeat the entire process for 1:1 and 9:16

Steps 3 and 4 are the problem. Ten photos: fine. Sixty photos in three ratios: that's 180 manual crop adjustments.

## The Photoshop way: actually batch it

Photoshop can automate this — natively via Actions + Batch, which works but produces dumb center crops, and center crops behead singers just as reliably as synced ones.

This annoyed me enough that I built a plugin for it: [BatchCrop](/shop/batchcrop), a Photoshop extension that crops entire folders to any ratio or size in one run. Point it at your export folder, set 4:5 at 1080×1350, run — then repeat for the other ratios. What took an evening takes minutes, and it's on [Adobe Exchange](/shop/batchcrop) so it installs straight into Photoshop.

My full social delivery flow:

1. Export finished edits from Lightroom, full resolution, into a `/socials` folder
2. BatchCrop → 4:5 pass, 1:1 pass, 9:16 pass into separate subfolders
3. Spot-check the handful where the subject is far off-center, fix those manually
4. Zip per ratio and deliver

Step 3 matters: automation gets you 90% of the way, your eye does the last 10%. That's still a 10× time win.

## Don't skip the sharpening

One detail everyone misses: a 1080px Instagram export from a 45MP file needs **output sharpening** or it lands soft. In Lightroom's export dialog: Sharpen For Screen, Standard. If you're exporting from Photoshop after cropping, a light Smart Sharpen (amount ~60, radius 1.0) on the resized file does the same.

## Related

- [My full Lightroom editing workflow for concert photos](/blog/how-to-edit-concert-photos-in-lightroom)
- [Export settings for web, print and socials](/blog/lightroom-export-settings-for-concert-photos)
