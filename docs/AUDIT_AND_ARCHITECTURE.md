# JLED DESIGN STUDIO v4.0 — Audit Report & Technical Architecture
**Phase 01 Deliverable** | Baseline: `jled_3d_screen_simulator_configurator_led.html` (v3.5)

---

## 1. Executive Summary & Audit Findings

The original file `jled_3d_screen_simulator_configurator_led.html` represents a well-designed single-file proof-of-concept for JLED LED screen visualization. However, to scale into **JLED Design Studio v4.0** for production use by Sales, Pre-sales, and Technical Engineers, several critical architectural defects, memory leaks, and engineering calculation coupling issues have been identified:

| Component | v3.5 Implementation Issue | Impact | v4.0 Refactor Strategy |
| :--- | :--- | :--- | :--- |
| **State & Units** | Global object with mixed units (meters for dimensions, mm for pitch, sec for time). | Precision drift, confusion between customer request and actual buildable size. | Single Source of Truth (`src/core/state.js`) with **normalized physical units in millimeters (mm)**, converted to meters only at the UI layer. |
| **Domain Logic** | Tightly coupled with DOM: `updateDashboardAndUI()` computes values and directly mutates 20+ elements. | Unable to unit test calculations; logic cannot be reused across PDF export, project save, or compare lab. | Pure calculation engine (`src/core/calculation-engine.js`) decoupled from DOM and Three.js. 100% automated test coverage. |
| **Indoor / Outdoor** | Arbitrary rule `pitch >= 5 ? outdoor : indoor`. | Ignores actual products (e.g. Outdoor P3.91/P4, Indoor P5/P6). | Decoupled from pitch. Environment belongs to SKU / Catalog data model (`src/core/product-catalog.js`). |
| **3D Resource Disposal** | `clearGroup()` only disposed `child.geometry`. Skipped materials, textures, and child groups. | Rapid VRAM & JS heap memory leak when switching scenes or moving sliders. | Recursive Three.js memory cleaner (`src/core/disposal.js`) that traverses full hierarchy, disposes geometries, materials, and textures. |
| **Blob URL Leak** | `URL.createObjectURL(file)` called without revoking old object URLs. Video elements not paused or released. | Memory leak upon every media upload. | Explicit media tracker tracking active blob URLs and calling `URL.revokeObjectURL()` on replacement/reset. |
| **Per-Frame Canvas Load** | Every frame redraws 2D canvas, samples pixels, and triggers `screenTexture.needsUpdate = true` (60-120fps). | High CPU/GPU usage on laptops/mobile, battery drain even with static image. | Dirty flag system + dynamic animation throttling + Page Visibility API (pauses rendering when tab is hidden). |
| **Requested vs Buildable** | Used `Math.round(w / cabSize)` without reporting actual physical dimension or cabinet count discrepancy. | 3D screen geometry rendered at customer's theoretical size instead of actual physical cabinet boundary. | Engine calculates both `requestedDimensionsMm` and `actualDimensionsMm`, grid layout suggestions, and visualizes actual physical boundary. |

---

## 2. Inventory of Existing v3.5 Features (100% Preserved)

1. **3 3D Environments:**
   - Executive Boardroom (`boardroom`) with polished floor, acoustic wood slats, conference table & chairs.
   - Exhibition Hall / Mall (`exhibition`) with glossy floor, stage platform with neon trim, backdrop and podium.
   - Outdoor Roadway (`outdoor`) with asphalt road, lane markers, building facade, windows, and streetlights.
2. **3 Installation Mount Types:**
   - Wall Mount (`wall`) with heavy rear brackets.
   - Ground Stack / Truss (`truss`) with vertical goalposts, heavy baseplates, top/bottom beams, and support legs.
   - Overhead Hanging Rig (`hanging`) with overhead truss bar, rigging shackles, and suspension wire ropes.
3. **Pixel Pitch Selection:**
   - Fine Pitch: P1.25, P1.5, P1.8
   - Standard Indoor: P2, P2.5, P3, P4
   - Outdoor: P5, P6, P8, P10
4. **Viewing Distance Simulator:**
   - Range 1.0m to 30.0m with live distance indicator.
   - Visual status pill: Optimal (ภาพเนียนคมชัด) vs Too Close (ใกล้เกินไปเห็นเม็ดพิกเซล).
   - Dynamic 2D canvas downsampling mimicking discrete SMD LED lamps.
5. **Top-Right LED Matrix Loupe Magnifier:**
   - Real-time zoomed crop of the center screen showing physical diode spacing and optimal/warning tag.
6. **Camera Controls & Presets:**
   - OrbitControls (left click rotate, right click pan, scroll zoom).
   - Presets: Front Face (`cam-front-btn`), 45° Perspective (`cam-angle-btn`), Human Eye Level 1.65m (`cam-human-btn`), Close-up 1.2m (`cam-closeup-btn`).
7. **Scale References & Overlays:**
   - 1.70m human scale reference figure with height line marker (Toggleable).
   - Cabinet Grid overlay lines on the screen surface (Toggleable).
8. **Aspect Ratio Presets:**
   - 16:9 (4.0 × 2.25m), 21:9 (7.0 × 3.0m), 9:16 (2.0 × 3.5m), and custom Width (1-20m) / Height (1-12m) sliders.
9. **Media Pipeline:**
   - Presets: 3D Cyber Motion Ad (animated canvas), Seminar Keynote Live (chart + speaker card), Vibrant Retail Sale (rotating sunburst).
   - Local Custom Upload: Image and Video with HTML5 `<video>` canvas bridge.
10. **Live Engineering Dashboard:**
    - Total dimensions (W × H m) & Total area ($m^2$).
    - Total cabinet count & column × row grid configuration.
    - Resolution (W × H px) & Total pixels (Millions).
    - Recommended viewing distance metric.
    - Power consumption: Avg kW and Max kW.
    - Resolution quality badge: SD, HD Ready, Full HD, 2K QHD, 4K Ultra HD.
11. **Quotation & Commercial Workflow:**
    - Spec summary modal with formatted Thai quotation specification.
    - Copy to clipboard button with fallback.
    - LINE OA (@JLED) contact button.
    - Reset to default button.

---

## 3. Modular Architecture (Phase 01)

The refactored system is broken into clean, testable ES modules:

```
JLED web/
├── backup/
│   └── jled_3d_screen_simulator_configurator_led_v3.5_original.html
├── src/
│   ├── core/
│   │   ├── constants.js          # Normalized constants, defaults, units, conversion helpers
│   │   ├── state.js              # One source of truth, subscribe/notify, immutable updates
│   │   ├── disposal.js           # Deep Three.js resource cleaner (geometry, material, texture, blob)
│   │   ├── calculation-engine.js # Pure calculation engine: cabinets, resolution, power, viewing dist
│   │   └── product-catalog.js    # Data model for JLED LED models, verified vs demo status
│   ├── rendering/
│   │   ├── scene-builder.js      # Three.js environments (boardroom, exhibition, outdoor), mounts, human
│   │   └── canvas-engine.js      # 2D LED matrix generation, loupe preview, dirty check, visibility pause
│   ├── ui/
│   │   └── dom-manager.js        # DOM data-binding, event listeners, modal and toast controllers
│   └── app.js                    # Application orchestrator bootstrap
├── tests/
│   ├── calculation-engine.test.js # Automated unit tests for calculation engine
│   ├── state.test.js              # Unit tests for state management & unit normalization
│   ├── product-catalog.test.js    # Unit tests for catalog validation & compatibility
│   └── disposal.test.js           # Unit tests for resource disposal utilities
├── scripts/
│   ├── build.js                  # Builds standalone deployable HTML without build step locks
│   └── serve.js                  # Lightweight local server for testing
├── docs/
│   └── AUDIT_AND_ARCHITECTURE.md
├── package.json
└── index.html                    # JLED Design Studio v4.0
```
