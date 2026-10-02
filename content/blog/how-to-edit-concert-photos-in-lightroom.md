---
title: "How to Edit Concert Photos in Lightroom: My Full Workflow"
description: "A step-by-step Lightroom workflow for concert photos — white balance under LED light, noise reduction at high ISO, fixing color casts and finishing files that clients accept."
date: "2026-09-20"
category: "Editing"
tags: ["lightroom", "editing", "workflow", "concert photography"]
affiliate: false
draft: false
---

Shooting a concert is half the job. The other half happens afterwards, when you open 1,500 RAW files shot at ISO 2500–12800 under red, blue and magenta LEDs — and every white balance slider seems to make things worse.

I shoot concerts for North Sea Jazz, MOJO and Radio 538, usually with same-day or next-morning delivery. That deadline forced me to build an editing workflow that is fast *and* repeatable. This is that workflow, step by step, in Lightroom Classic.

## Step 0: Cull before you edit anything

The fastest edit is the photo you don't edit. Go through your shoot once, full screen, and flag only the keepers — don't rate, don't compare six near-identical frames, just pick or reject. For a club show I keep 40–80 images; for a festival day, a few hundred.

Only the flagged photos enter the workflow below.

## Step 1: Fix white balance first — always

Under stage lighting, every other slider lies to you until white balance is roughly right. Skin tone is your anchor: find a frame where light hits the artist's face and adjust temperature and tint until skin looks human, not radioactive.

Two realities of LED stages:

- **There is no "correct" white balance** for a scene lit by three different colored sources at once. You're choosing the least-wrong compromise — usually the one that protects skin.
- **Auto WB gets you nowhere.** The eyedropper on a gray stage element gets you closer, then finish by eye on skin.

## Step 2: Rescue the highlights, protect the blacks

Stage light is contrast at its most extreme: a spotlight face over a pitch-black stage. My standard starting point:

- Highlights: −60 to −100 (the spotlight side of the face)
- Shadows: +20 to +40 — but **resist lifting shadows to +80**. A concert photo is allowed to be dark; that's the atmosphere. Lifted shadows are where noise lives.
- Blacks: leave a true black point. Milky blacks are the most common beginner tell in concert edits.

## Step 3: Noise reduction that doesn't smear

At ISO 2500 (my usual working range on the Canon R5 Mark II) modern full-frame files barely need help. Above ISO 6400:

- **Lightroom's AI Denoise** is genuinely good — but slow on 1,500 files. Use it only on the hero shots.
- For the rest: Luminance NR at 15–25, and *raise* the masking on sharpening so you're not sharpening noise in the empty black areas.
- Never judge noise at 100% zoom at 2 a.m. Nobody views concert photos at 100%.

## Step 4: The color cast — the part everyone struggles with

Red and blue LED washes clip an entire color channel: a face lit by pure red light has *no* green or blue information left. No slider brings back what the sensor never recorded. What actually works:

- **HSL panel**: pull the offending color's saturation down (red −20 to −40) and its luminance up slightly, so the clipped channel stops screaming.
- **Calibration panel**: shifting the red and blue primaries is more natural than HSL for global casts — it's the closest thing Lightroom has to a magic slider for stage light.
- **Accept the light**: sometimes the right edit is committing to the red frame as a *red frame* — or going black and white when the color is truly unusable.

This step is 80% of concert editing time, and it's exactly why I eventually turned my own correction steps into presets — see step 6.

## Step 5: Finishing touches

- Texture +10–20 on close-ups; skip Clarity, it crunches stage haze into mush.
- A subtle vignette (−10) focuses attention when the stage edges are messy.
- Crop straight. Tilted horizons read as sloppy in editorial use; a *deliberate* dutch angle is fine, 2 degrees of accident is not.

## Step 6: Sync, don't repeat

Songs have lighting scenes. Edit one frame per lighting scene properly, then select every frame from the same scene and hit **Sync**. This single habit takes a festival edit from six hours to two.

And this is where presets earn their place — not as a one-click "look", but as repeatable *steps*. After years of rebuilding the same corrections show after show, I packaged my own workflow into [Stage Fix](/shop/stage-fix-v6): a modular system of 90 presets (plus 15 reset presets) for Lightroom Classic and Adobe Camera Raw, split into correction, stabilizing and finishing steps — built specifically for mixed and ugly stage light. It's the exact system I deliver client work with.

## The workflow in one list

1. Cull hard — only keepers get edited
2. White balance on skin, per lighting scene
3. Highlights down, blacks kept black
4. Noise reduction proportional to ISO; AI Denoise for heroes only
5. Kill color casts via HSL + Calibration — or embrace them
6. Sync per lighting scene, export, deliver

**Related:** [Fixing red and blue LED color casts in detail →](/blog/fix-led-color-casts-in-concert-photos)
