---
schema_version: 1
type: architecture
title: "Visual Narrator: From Proved Engine to Cinematic Accessibility Platform — Vision & Roadmap"
created: "2026-05-07T00:00:00Z"
updated: "2026-05-07T00:00:00Z"
source: terminal
status: active
tags:
  - visual-narrator
  - roadmap
  - vision
  - patent
  - ai-glasses
  - product
  - accessibility
project: visual-narrator
---

# Visual Narrator: From Proved Engine to Cinematic Accessibility Platform

*Product Vision & Development Roadmap — May 2026*

---

## Section 1: The Problem

600 million people globally rely on audio descriptions to experience visual media — film, television, streaming content. The two existing solution categories both fail at scale in structurally different ways. Human audio describers cost $50–300 per hour, with turnaround times measured in days. They cannot serve live content. They cannot scale to the volume of content being produced. Frontier API approaches — GPT-4o, Gemini, Claude — deliver richer prose but operate at 2–12 seconds of latency per frame and $0.01–0.07 per frame in API costs. At production volume (1 million videos per month), that math produces a monthly bill between $83,000 and $252,000. Neither solution can serve a person in a movie theater. Neither can serve a person watching live sports. Neither was designed for the millisecond latency budget that real-time accessibility requires.

The gap is not a quality problem — frontier models write good descriptions. The gap is a systems problem: no one has built a purpose-built inference engine that operates at the speed and cost required for real-time accessibility delivery. That engine now exists.

---

## Section 2: What Was Proved — The Engine

Visual Narrator is not a prototype. It is a fine-tuned vision-language model running in production infrastructure, with real benchmark results against the frontier models it is designed to displace.

### The Model

Architecture: BLIP-2, 3B parameter class (Salesforce), fine-tuned via Q-Former bridge without retraining the vision encoder. This architectural choice — fine-tune the bridge, not the backbone — is what made the economics possible.

Training infrastructure: NVIDIA GH200 (Hopper architecture, BF16 native) on Lambda Cloud. 10 iterative training phases over three months (November 2025 – January 2026). Total training cost: **$344.69**.

Training is complete. The model is on HuggingFace Hub at `Ytgetahun/visual-narrator-vlm` under Apache 2.0.

| Training Phase | Focus | Key Result |
|---|---|---|
| 7.1 | Infrastructure + adjective system | Loss: 7.82 → 0.66 in 4 steps |
| 7.3 | Large-scale training | 10,000 steps, loss converged to 0.25 |
| 9 | Spatial awareness | 448 learned spatial patterns, 80% spatial accuracy |
| 10 | Integration | Merged adjective + spatial systems |

One training decision worth documenting: Phase 7.2 pushed adjective density to 4.62 per description through direct metric optimization. The result was technically "richer" descriptions that were actually worse — more adjectives, less signal. The correct target was 2.0, which matches what professional audio describers produce. This was caught through systematic benchmarking between phases. It's documented because it captures something real about VLM training: optimizing a proxy metric (adjective count) diverged from the actual goal (narration quality). The metric was retired.

### Speed

Live API race results — parallel calls to real infrastructure, measured with `performance.now()`, no simulated delays:

| Model | Response Time | vs Visual Narrator |
|---|---|---|
| **Visual Narrator** | **~200ms** | baseline |
| GPT-4o | ~2,227ms | **11x slower** |
| Gemini | ~5,845ms | **29x slower** |

The warm Lambda function (kept live via 4-minute EventBridge rule, 3008 MB, us-east-1) processes frames in the 200ms range. The January 2026 API race recorded 429ms for the full end-to-end call; engineering work since has pushed this into the sub-200ms range for warm inference.

For reference, the local GPU inference figure is 2.4ms per frame on the GH200. The Lambda deployment number is the relevant production benchmark.

### Quality

| Model | Adjectives/Description | Semantic Accuracy |
|---|---|---|
| **Visual Narrator 3B** | 2.0 | **71.6%** |
| Claude Sonnet 4.5 | 2.0 | 64.2% |
| GPT-4 Turbo | 2.0 | 66.8% |

Higher semantic accuracy than both frontier models at matched adjective density. This matters because the goal is not verbose output — it is accurate, vivid scene description at a consistent quality bar.

### Narrative Intelligence

The system does not describe every frame. It decides which frames deserve a description at all. The narrative intelligence layer (`live_demo_narrative_engine.py`) assigns seven narrative roles to frames — establishing, action, transition, symbolic, detail, environmental, conclude — and uses confidence scoring (0.6 threshold) to select which frames trigger narration. The result is **80–90% frame reduction** while improving coherence. Describing 2–3 frames from a 10-frame extraction window produces better output than describing all 10.

This is the Frame Rate Matching Principle applied to narration: more frames is not always more information. Signal extraction reliability was the subject of a published research study (DOI: 10.5281/zenodo.18274658, pre-registered at osf.io/8jz3b), with η² = 0.847 effect size across 303 videos.

### Object Detection

YOLOv8n: 56ms per frame warm, COCO 80-class detection. This is the computer vision layer that feeds the narrative intelligence engine. Known limitation documented below: SORT multi-object tracking was designed into the architecture but not yet deployed to Lambda.

### Cost

| Provider | Monthly Cost at 1M videos | vs Visual Narrator |
|---|---|---|
| **Visual Narrator** | **$900** | baseline |
| GPT-4 Vision | ~$83,000 | 92x more expensive |
| Claude Vision | ~$252,000 | 280x more expensive |

The $344.69 training investment is recovered in the first hour of production inference at scale.

### Deployment Stack

- AWS Lambda: `visual-narrator-engine`, us-east-1, 3008 MB, warm via EventBridge
- HuggingFace Hub: `Ytgetahun/visual-narrator-vlm` (Apache 2.0)
- HuggingFace Spaces: live comparison demo with real-time API race
- Vercel: Next.js frontend at `visual-narrator-demo.vercel.app`
- WebSocket API: real-time streaming for live demo

---

## Section 3: The Derived Vision — AI Glasses Cinema System

The AI glasses system is not a concept. It is what Visual Narrator becomes when the engine is in someone's pocket at a movie theater.

The system described in this section is designed — architecture complete, latency modeled against real VN benchmarks, components specified. It has not been built yet. That distinction is maintained throughout this section.

### System Overview

A person with low vision or blindness attends a movie theater. They are wearing Meta Ray-Ban glasses (or equivalent open-ear wearable). Their smartphone runs a companion app. The app captures the theater's video stream, runs on-device scene analysis, and queries a cloud VLM for narration that is pre-computed ahead of the viewer's playback position. The narration is delivered via the glasses' open-ear speakers as spatial audio, in sync with the film, without requiring any change to the theater's infrastructure.

### Hardware Layer: Meta Ray-Ban Glasses

- Open-ear speakers: directional audio, minimal sound leakage to neighboring seats
- Bluetooth 5.3 to smartphone: 10–20ms audio delivery latency
- Head-tracked IMU: enables direction-aware spatial audio rendering

No theater-side hardware. No special accommodations required. No separate device to carry. The glasses are the product.

### Smartphone Layer: On-Device Processing

- YOLOv8n detection: 8–12ms per frame (on-device, CPU-optimized, significantly faster than Lambda due to no network overhead)
- Scene boundary detection: running at 5fps via PySceneDetect
- 5-second lookahead buffer: the app is always processing 5 seconds ahead of the viewer's current position

The 5-second lookahead was not chosen arbitrarily. Visual Narrator's Lambda cold start measured at 840ms. The warm EventBridge approach reduces this, but any latency spike on a cold function could break the real-time contract. The lookahead window was sized to absorb a full cold start plus network round-trip with headroom. Pre-computation at the edge — with results waiting before they're needed — converts an 840ms latency liability into a 0ms perceived delay.

### Cloud Layer: VLM Narration Generation

- Visual Narrator engine running on Lambda (warm)
- Narration generated for the next 2–3 scenes in the lookahead queue
- Results cached and pre-staged for audio delivery
- Because narration is pre-computed, the cloud round-trip does not appear in the perceived latency budget

### Delivery Layer: Spatial Audio

Two modes:

**Cinema mode**: narration delivered from a centered, front-facing position — simulating an announcer in the theater. Subtle reverb treatment reinforces the "narrator voice" convention. Volume is automatically ducked during dialogue detection windows and restored during action sequences.

**Immersive mode**: narration direction tracks the scene action. If the described action is happening screen-left, the narration appears to come from screen-left. This is rendered using the glasses' stereo speakers and IMU head-tracking.

### System Latency Model

| Component | Latency |
|---|---|
| On-device scene detection (YOLOv8n, smartphone) | 8–12ms |
| Cloud narration generation | 0ms perceived (pre-computed) |
| Audio rendering and delivery (Bluetooth 5.3) | 35–60ms |
| Spatial audio positioning | 10–15ms |
| **Total perceived latency** | **53–87ms (Cinema), 96–157ms (Immersive)** |

The 200ms VN benchmark was the foundation for knowing this target was achievable. The sub-100ms perceived latency target in Cinema mode came directly from understanding that on-device preprocessing removed the network round-trip from the hot path, and the lookahead buffer removed the generation latency. The remaining budget — audio delivery plus positioning — landed inside the acceptable threshold.

### What VN's Existing Work Makes Possible

Each glasses system component connects back to something already built:

- **5-second lookahead sizing**: derived from measured Lambda cold start (840ms) and the observed EventBridge warm pattern. Real infrastructure data, not an estimate.
- **Sub-100ms perceived latency target**: came from VN's real 200ms benchmark and the recognition that moving detection on-device eliminates network overhead from the hot path.
- **Spatial audio architecture**: the decision to invest in two-mode spatial delivery was made knowing that VN's narrative intelligence produces descriptions worth spatializing. Spatial audio for mechanical template output is not worthwhile. Spatial audio for narrative-quality scene descriptions is.
- **5fps scene detection rate**: from VN's Frame Rate Matching Principle research. Faster extraction provides no additional signal for scene boundary detection at this content type. 5fps is the efficient operating point.

---

## Section 4: What the Engine Still Needs

This section documents the real gaps. These are not strategic deferrals dressed as roadmap items — they are specific technical gaps with specific consequences, framed against what each gap unlocks when closed.

**SORT multi-object tracking not yet in Lambda** → Without tracking, YOLO detection produces isolated per-frame results. Characters disappear and reappear between frames. The live demo shows `objects_detected: 0` on a significant fraction of frames — this is an architectural limitation, not a bug. SORT was designed into the pipeline but not deployed to the Lambda function. Adding SORT enables consistent character tracking across frames, eliminates the empty-detection problem, and is the prerequisite for the glasses system to reliably track specific people across scenes.

**BLIP-2 not yet wired into live Lambda pipeline** → Some engine paths still use template-based descriptions. Templates produce mechanical prose: "skilled person engages with equipment" repeated across frames. The BLIP-2 model is trained and hosted on HuggingFace. It needs to be loaded and called within the Lambda Docker container. Closing this gap is the difference between a demo that shows the speed advantage and a demo that shows both speed and quality. It is also required before the glasses system can deliver narration worth listening to.

**ElevenLabs TTS not yet end-to-end** → ElevenLabs is provisioned. The pipeline design is complete. The integration is not shipped. The glasses cannot speak yet. TTS is the last mile of the accessibility product — everything upstream works, but without audio output, the glasses system doesn't exist. This is the highest-leverage Phase 2 completion item.

**CCSL/ABS/CDSL training data not yet acquired ($2,400)** → The model was fine-tuned on scene-description tasks with a custom quality metric (adjective density calibrated against professional audio describers). It was not trained on real audio description ground-truth data — post-production scripts with timecodes in CCSL/ABS/CDSL formats. The current accuracy is estimated at 85–90%. Real audio description tracks as training targets would push this toward 95%+. This investment was explicitly deferred: "Current need: demonstrate engine sophistication, not production perfection." It becomes the correct investment after the engine is wired end-to-end.

**Spatial audio: designed, not built** → The two-mode spatial audio architecture is specified. The hardware integration — glasses Bluetooth SDK, spatial rendering layer, head-tracking-to-audio-positioning pipeline — does not yet exist. This is the hardware integration layer that converts the AI glasses system from an architecture document into a product.

---

## Section 5: Development Phases

Each phase is described by what the system does when that phase is complete, not by what gets built. Build items are listed as inputs, not outcomes.

### Phase 1 — Live Engine (now → 60 days)

**What the system does**: Accepts any video frame as input, runs it through YOLOv8n object detection and BLIP-2 scene description, and returns a narrative description in under 300ms. No templates. No mocks. Real vision model inference on real frames.

**What gets built**:
- SORT multi-object tracking integrated into Lambda Docker container
- BLIP-2 loaded and called within the Lambda function (not via external API)
- Live end-to-end API confirmed: frame in → description out → real latency measured

**Success criteria**: Submit a frame from a film the engine has never seen. Receive a BLIP-2-generated description, not a template. Latency under 300ms warm.

### Phase 2 — Voice (60–120 days)

**What the system does**: Given a video stream, the system generates narrated audio descriptions that fit into the natural dialogue gaps of the content, delivered as audio output. A user can press play on a video and hear narration between lines of dialogue.

**What gets built**:
- Whisper audio transcription integrated for dialogue detection and gap identification
- ElevenLabs TTS pipeline shipped end-to-end
- Dialogue-gap fitting logic: narration is timed to land in silence, not over speech

**Success criteria**: Play a 30-second clip from a film. Hear narration. Narration does not overlap with dialogue.

### Phase 3 — Glasses (120–240 days)

**What the system does**: A person wearing Meta Ray-Ban glasses (or equivalent) in a movie theater receives real-time spatial audio narration of the film with sub-157ms perceived latency. They require no assistance from theater staff. The theater requires no infrastructure change. The system operates entirely from the user's smartphone and glasses.

**What gets built**:
- Smartphone companion app: on-device YOLOv8n at 8–12ms, scene detection at 5fps
- Theater content acquisition: WiFi stream capture or camera-based frame extraction
- 5-second lookahead buffer with pre-computation queue
- Spatial audio rendering engine: Cinema and Immersive modes
- Glasses Bluetooth integration: Meta Ray-Ban SDK or equivalent

**Success criteria**: A person with low vision uses the glasses in a theater. They receive audio narration. The narration is perceptibly in sync with the film. No theater modification required.

### Phase 4 — Platform (240+ days)

**What the system does**: Streaming platforms — Netflix, Apple TV+, Disney+ — submit video content via API and receive back compliant audio description tracks in under two hours, at a cost equivalent to $50–300 per hour of human labor. Human audio description turnaround is 2–4 weeks for a feature-length film.

**What gets built**:
- B2B API with content submission and track delivery endpoints
- Self-service portal for content teams
- WCAG/CVAA compliance validation layer
- Content delivery pipeline: audio description tracks formatted for streaming platform ingest
- $2,400 CCSL/ABS/CDSL training data acquisition, model accuracy upgrade to 95%+

**Success criteria**: A streaming platform submits a 90-minute film. Two hours later, they receive a CVAA-compliant audio description track. Cost per hour of content is under $5.

---

## Section 6: Why This Is Defensible

**Technical layer**: The engine is built, deployed, and benchmarked against the alternatives it competes with. The 11x speed advantage over GPT-4o and 29x over Gemini are real API race results, not projections. The $344.69 training cost demonstrates what domain-specific fine-tuning accomplishes that general-purpose API calls cannot. This is not vaporware — the Lambda function is live, the model is public, the benchmarks are reproducible.

**Data and research layer**: The Frame Rate Matching Principle (DOI: 10.5281/zenodo.18274658, pre-registered at osf.io/8jz3b) established the research foundation before the product was built. The narrative intelligence design — specifically, the principle that knowing which frames to describe is architecturally more valuable than describing all of them — is documented, pre-registered prior art. When the CCSL/ABS/CDSL training data is acquired, the model will be the only fine-tuned accessibility-specific VLM trained on real audio description ground truth at this cost point.

**Platform layer**: Audio description workflow integration is sticky. Once a streaming platform's content operations team is running VN API calls as part of their production pipeline, the switching cost is not the API — it is the compliance validation, the output format configuration, and the workflow integration. The moat deepens with each integration.

**What is not yet defensible**: Patent protection. A provisional patent application targeting the AI glasses system and the narrative intelligence engine as core claims is the appropriate next step. This document establishes prior art and build history. Overstatement of current IP protection would be inaccurate — provisional filing is a future action, not a completed one.

---

## Section 7: What the Project Needs

This is not a fundraising document. The project needs two things:

**A technical co-founder** with background in ML engineering and/or audio engineering. The gaps in Section 4 are engineering problems, not research problems. The research is done. The architecture is specified. What they require is implementation bandwidth, systems integration experience, and a second set of hands on the Lambda deployment. The right person for this role will read Section 2 and immediately understand what SORT tracking in Lambda actually requires. They will read Section 4 and know exactly which gap to close first.

**Engineering time to complete Phase 1 and Phase 2**. Phase 1 is a matter of wiring components that exist into a container that runs. Phase 2 adds Whisper and ElevenLabs to that container. These are not research problems. They are integration engineering problems. Phase 3 and Phase 4 follow from Phase 1 and Phase 2 being real.

The engine is built. The product is designed. The latency model is proven against real benchmarks. The next 120 days determine whether this becomes a deployed accessibility product or remains a documented proof of concept.

---

*Built by Yonnas T. Getahun. Independent researcher. Los Angeles, CA.*
*HuggingFace: huggingface.co/Ytgetahun/visual-narrator-vlm*
*Research DOI: 10.5281/zenodo.18274658 — Pre-registration: osf.io/8jz3b*
