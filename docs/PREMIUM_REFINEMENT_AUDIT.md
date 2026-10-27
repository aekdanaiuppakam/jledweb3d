# JLED Design Studio — premium refinement audit

## Priority findings

| Severity | Finding | Evidence | Resolution |
| --- | --- | --- | --- |
| Critical | Default 4 m LED was visually lost in a 36 m wide, 8.5 m high boardroom. | Original `buildBoardroom` dimensions and the pre-refinement browser view. | Boardroom now starts at 10 × 12.8 × 3.9 m and grows only when the assembled display requires it. |
| Critical | Cyan point and spot lights were forced to 1.6 and 1.8 intensity every frame, creating artificial patches. | Original render loop in `index.html`. | Replaced with restrained neutral-blue display spill of 0.16 and 0.07 maximum visual intensity. |
| Major | Table, chair, wall and ceiling elements had weak human scale and primitive finishes. | Scene source audit; current screenshot showed the boardroom wall and oversized foreground scale marker. | Added a textured floor, architectural trim and door, a detailed timber table, swivel seating and narrow ceiling diffusers; muted and repositioned the marker. |
| Major | Camera presets used the viewing-distance value as a fixed camera offset, so Hero cropped out the room. | `syncCameraToViewingDistance` and the interim Hero screenshot. | Camera poses now derive from actual screen size, clamp inside the boardroom, and animate toward a screen-centred target. |
| Major | Many 9–11 px labels, bright cyan effects and always-open controls competed with the 3D view. | UI audit and interim screenshots. | Refined typography, spacing and palette; grouped scene, spatial and overlay controls in disclosures; added keyboard focus and reduced-motion styles. |
| Major | LED canvas was redrawn and uploaded on every animation frame, including still images. | Original render loop. | Animated content is capped at 30 texture updates/s; images and test patterns update when their inputs change. Runtime FPS and GPU memory still need measurement in an approved browser session. |
| Minor | Default visual brightness state used `1.0` while the UI treated it as `1%`. | State default and slider/render code. | Visual brightness accepts normalized saved values and older percentages; slider stores 0.5–1.5 multipliers. Engineering values are unchanged. |

## Implementation order

1. Set credible room proportions and preserve the independent LED assembly and calculation engine.
2. Refine physical materials, furniture, architectural detailing and shadow-producing light placement.
3. Replace screen spill and add Day, Warm, Cool and Presentation grades while retaining existing Sunset and Night choices.
4. Fit camera presets to assembled dimensions, add room bounds, then reduce viewport UI noise.
5. Review actual screenshots, correct composition problems, and run calculation, state, export and camera regressions.

## Verification

- Before implementation: 53 existing tests passed.
- After implementation: 57 tests passed, including camera-room and Presentation grade checks.
- Embedded page module passes JavaScript syntax checking; `git diff --check` is clean.
- Actual interim browser screenshots were reviewed: [Front](screenshots/interim-front.png) and [initial Hero](screenshots/interim-hero.png). They revealed an oversized cyan human marker and a Hero camera that excluded furniture. The marker and Hero pose were changed after that review.
- Browser automation then stopped because it could not verify Chrome's current URL while opening a baseline tab. No true before image or screenshot of the final Hero, lighting presets, resizing and all interactions could be captured. The visual acceptance criteria and live performance measurement remain open.

## Remaining visual QA

When a verified local browser session is available, capture a fresh default Hero and Front view, then test all camera and lighting presets, width/height and pitch changes, environment switching, mode disclosures, project export and responsive widths. Record frame time and renderer memory before claiming performance parity. Position controls can still move an installation into fixed room furniture, and unusually tall displays require venue-scale rooms; these need product rules before they can be resolved without restricting engineering inputs.
