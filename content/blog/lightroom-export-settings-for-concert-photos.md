---
title: "The Right Export Settings for Concert Photos: Web, Print & Socials"
description: "Copy-paste Lightroom export settings for client galleries, editorial delivery, print and Instagram — resolution, sharpening, color space and file naming that survives real client use."
date: "2026-09-20"
category: "Workflow"
tags: ["lightroom", "export", "workflow", "delivery", "concert photography"]
affiliate: false
draft: false
---

Export settings sound like the boring part of photography — until an editor publishes your soft, oversharpened or weirdly-colored file with your name under it. Delivery is the last step where things can go wrong, and the settings below are what I use for actual client work: editorial, artist management, print and socials.

## The one rule: export per destination

There is no single "best" export. A file built for a magazine spread is wrong for Instagram, and vice versa. I export every delivery into destination-specific folders, from the same edited originals.

## Client gallery / editorial delivery

This is the master delivery — what goes to the label, venue or magazine:

- **Format:** JPEG, quality 90–100
- **Color space:** sRGB (yes, even for editorial — unless print explicitly asks for Adobe RGB, sRGB is the safe default that never renders wrong)
- **Size:** full resolution, no downsizing
- **Sharpening:** Screen, Standard
- **Naming:** `YYYYMMDD_Artist-Venue_YourName_0001` — editors search their downloads folder; a file called `IMG_8693.jpg` gets lost, a file with the artist and your name in it gets credited

Deliver fast. My own galleries go out via my download portal the same night or next morning — speed of delivery is a booking argument, not just a courtesy.

## Web / portfolio

- **Size:** 2560px long edge (crisp on retina screens, small enough to load fast)
- **Quality:** 80–85 — visually identical to 100 at half the file size
- **Sharpening:** Screen, Standard
- **Metadata:** keep copyright info in the file, strip location data

## Instagram & socials

- **Size:** 1080×1350 (4:5), 1080×1080 (1:1), 1080×1920 (9:16)
- **Quality:** 85+ — Instagram recompresses everything anyway; feed it a clean file
- **Sharpening:** Screen, Standard — a 1080px file from a 45MP original *needs* this or it lands soft

Cropping sixty photos into three ratios is its own problem — I wrote a [separate guide on batch cropping for Instagram](/blog/batch-crop-concert-photos-for-instagram) including the Photoshop plugin I built for it.

## Print

- **Format:** JPEG quality 100 (or TIFF if the printer asks)
- **Color space:** what the print house specifies; sRGB when in doubt — a "wrong" Adobe RGB workflow looks desaturated everywhere
- **Resolution:** native pixels, don't upsample; a 45MP file prints A2 without help
- **Sharpening:** Matte or Glossy per paper, Standard amount

## Slicing carousels and banners: the odd one out

One export job Lightroom simply can't do: cutting a single wide image into equal slices — Instagram carousels that pan across a stage shot, web banners split into segments, print panels. That's Photoshop territory, and doing it with guides and manual crops is fiddly enough that I built [Export Every X](/shop/export-every-x), a small Photoshop plugin that slices any image into X equal parts and exports them in one go. If you've ever posted a three-panel festival panorama carousel: that's the tool.

## My export presets, in practice

All of the above lives as saved Export Presets in Lightroom (right-hand panel in the export dialog → Add). Set them up once, and delivery becomes: select, right-click, Export With Preset, done. The full journey from pit to delivered gallery is in [my complete editing workflow](/blog/how-to-edit-concert-photos-in-lightroom).
