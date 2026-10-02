---
title: "How to Fix Red and Blue LED Color Casts in Concert Photos"
description: "Why LED stage light ruins skin tones, what's actually recoverable in Lightroom, and the exact panels that fix red, blue and magenta casts — from a working concert photographer."
date: "2026-09-20"
category: "Editing"
tags: ["lightroom", "LED light", "color cast", "editing", "concert photography"]
affiliate: false
draft: false
---

Every concert photographer knows the frame: perfect moment, great composition — and the singer's face is a saturated red blob with no detail. Or blue. Or that special LED magenta that makes everyone look like an alien.

This is the single most-asked question I get about concert editing, so here is the complete answer: why it happens, what's recoverable, and what isn't.

## Why LED light breaks your files

Modern LED stage fixtures produce extremely narrow-band color. A "red" LED wash is almost *pure* red — nearly zero green or blue wavelengths reach your sensor. That means:

- The **red channel clips** (blows out) while the green and blue channels record almost nothing.
- Detail in a face lit by pure red light exists *only* in the red channel — and that channel is overexposed.
- No white balance setting can fix this, because white balance rebalances channels; it cannot invent data in channels that recorded nothing.

Understanding this changes how you shoot: **under a heavy color wash, expose for the colored channel.** Underexpose by ⅔ to 1 stop from what the meter says. A slightly dark frame with an intact red channel is recoverable; a clipped one is not.

## The fix, in order of effectiveness

### 1. Temperature and tint get you in the neighborhood

Set white balance for skin first (see the [full editing workflow](/blog/how-to-edit-concert-photos-in-lightroom)). Under a red wash you'll usually end up cooler and greener than expected. Don't chase perfection here — just get skin from "radioactive" to "warm".

### 2. HSL: turn the volume down

In the HSL panel, for the offending color (usually red or magenta):

- **Saturation −20 to −40** — this alone fixes half the problem
- **Luminance +10 to +20** — recovers apparent detail in the compressed channel
- Careful with orange: that's where skin lives. Desaturate red, then check you haven't zombified the skin tones via orange.

### 3. Calibration: the closest thing to a magic panel

Scroll down to **Calibration** (the most ignored panel in Lightroom). Shifting the **red primary hue** toward orange and dropping its saturation slightly rebalances the entire image more naturally than HSL, because it changes how colors are *built* rather than repainting them afterwards. For blue washes, the same logic with the blue primary.

Small moves — ±10 — do a lot here.

### 4. When color is unrecoverable: commit or convert

Two frames out of every heavy-wash sequence are usually beyond rescue. Your options:

- **Commit to the color.** A frame that is *deliberately, completely* red reads as atmosphere. A frame that is half-fixed reads as a mistake.
- **Black and white.** With a clipped color channel, use the B&W mix to build the conversion from the surviving channels. Some of my favorite deliveries from club shows are B&W for exactly this reason.

## Do this once, then never again

Here's the honest part: the corrections above are the same, show after show. Red wash at the Melkweg needs the same HSL and Calibration moves as a red wash at Ahoy. After rebuilding them manually for years, I turned my full correction chain into [Stage Fix](/shop/stage-fix-v6) — 90 modular presets (+15 resets) for Lightroom Classic and Adobe Camera Raw, organized as steps: correct the cast, stabilize the file, finish the look. One-click per step, stackable, and built specifically for LED-lit stages because that's what I shoot every week.

Whether you use my system or build your own preset set: stop doing this by hand every show. Your delivery deadline will thank you.

## TL;DR

| Problem | Fix |
|---|---|
| Face is a red/blue blob | Expose −⅔ stop at capture; the channel must not clip |
| Skin looks radioactive | WB on skin → HSL saturation −20/−40 on the cast color |
| Whole image feels off | Calibration panel: shift the primary hue, small moves |
| Nothing works | Commit to the color, or convert to B&W from the surviving channels |
