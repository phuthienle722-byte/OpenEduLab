# SIM_KHUC_XA_PHAN_XA_TOAN_PHAN_SPEC.md

## 0. Highest-priority requirement: simulation-first, highly interactive UI

**This is the top implementation priority.** Do not build a text-heavy lesson page with a small diagram. Build a simulation workspace in which the ray experiment is the visual focus and students learn by directly manipulating it.

### 0.1 Screen hierarchy

1. **Primary area (about 65–75% of desktop workspace):** a large, live 2D ray-optics canvas. It must remain the visual center of the screen.
2. **Control area:** compact, always-visible controls for incident angle and both media. Keep high-frequency controls close to the canvas.
3. **Live measurement area:** prominent numeric cards for `i`, `r`, reflection angle, `n1`, `n2`, critical angle, and the current state. Hide or relabel quantities that are not physically defined for the current state.
4. **Learning prompt area:** a short prediction question and contextual explanation; do not let long paragraphs displace the simulation.
5. **Progress / challenge area:** small step indicator such as Predict → Experiment → Explain → Check.

On narrow screens, stack the canvas first, then the angle/material controls, then measurements and learning prompts. Do not shrink the ray diagram into an unreadable thumbnail.

### 0.2 Direct manipulation and immediate feedback

- Dragging the incident-ray handle or moving the angle slider must update the incident ray, reflected/refracted rays, angle arcs, numerical measurements, and state label immediately.
- The student must be able to drag a clearly visible interaction handle on the ray diagram to change the incident angle; the slider and numeric value must stay synchronized with it.
- Allow selecting Medium 1 and Medium 2 directly from compact material cards or selectors. Show each material's name and refractive index before selection is committed.
- Provide one-tap challenge buttons: **Toward normal**, **Away from normal**, **Find critical angle**, **Just below critical**, **At critical**, **Just above critical**, and **Compare media**.
- Provide a “Show/Hide angle guides” toggle, “Show equation” toggle, and “Pause/Resume animation” control. These must change the interface state, not be decorative.
- Add a “Predict first” interaction: student chooses a prediction (toward normal / away from normal / no bending / total internal reflection) before revealing the result for a guided trial. The learner may still explore freely in an ungraded sandbox.
- Include a **Compare two trials** feature that pins the values and ray diagram state from one trial, then shows a second trial side-by-side or as a clear overlay. Include a **Clear comparison** action.
- Every control must have a visible effect, meaningful label, and a reset/default behavior. No dead buttons or fake interactions.

### 0.3 Visual design quality

- Use a polished, child-friendly science-lab visual style: clear typography, rounded control panels, bright but restrained accent colors, strong contrast, and purposeful micro-animations.
- Keep ray colors consistent across the application and pair them with labels, arrowheads, and line styles so color is never the only distinction.
- Use animated ray movement only when it clarifies propagation; keep it short, pauseable, and respectful of reduced-motion settings.
- Make the interface communicate the physics at a glance: the normal must be perpendicular to the interface; angle arcs must originate at the point of incidence and be measured from the normal; arrowheads must indicate direction.
- When TIR occurs, visually emphasize that the reflected ray stays in Medium 1 and remove the propagating refracted ray from Medium 2. Do not show a false transmitted ray.
- At the critical angle, animate or clearly transition the refracted ray until it lies along the interface, then label the critical state.
- Add subtle visual state changes for refraction, critical angle, and TIR, but never use visual effects that suggest energy/intensity quantities the model does not calculate.

### 0.4 Interaction and feedback states

Implement clear UI states for:
- idle / ready to predict;
- prediction selected;
- experiment running;
- result observed;
- hint shown;
- incorrect prediction with targeted hint;
- correct explanation;
- comparing trials;
- reset / new challenge.

Feedback should appear next to the relevant control or ray, not in a distant generic alert. Use a brief hint, let the student retry, then reveal the explanation. Keep the ray diagram visible while feedback appears.

### 0.5 UI performance and robustness

- Target fluid pointer/slider interaction; do not require a submit button for ordinary angle/material exploration.
- Separate physics calculations from rendering and controls so every interaction recomputes one canonical state.
- Debounce only expensive non-physics work; never make the ray lag behind the angle control.
- Ensure pointer dragging works on touch screens and does not scroll the page unintentionally while the user is dragging the ray handle.
- Preserve selected materials, angle, prediction, comparison state, and progress when switching Vietnamese/English.
- If rendering fails, show a visible recoverable error and keep the controls usable; never silently display stale measurements as if current.

### 0.6 UI acceptance criteria

The UI is not accepted unless:
1. The simulation canvas is the largest and most prominent element on desktop.
2. Dragging the ray handle changes the angle and every dependent visual/numeric value live.
3. Slider, numeric input, and drag handle remain synchronized in both directions.
4. Every challenge button loads a valid, understandable state.
5. TIR removes the transmitted ray; the critical-angle case shows the ray along the boundary.
6. Trial comparison visibly preserves and compares two distinct states.
7. The student can use the core simulation on a phone with no overlapping controls or unreadable angle labels.
8. Prediction, hint, retry, explanation, language switching, and reset all work.
9. There are no decorative controls that do nothing.
10. Physics acceptance tests in Section 9 still pass after the interface is implemented.


**Version:** 1.0  
**Status:** Ready for Google AI Studio Build  
**Product:** Interactive Grade 9 Natural Science simulation  
**Student-facing languages:** Vietnamese and English  
**Target duration:** 15–20 minutes  
**Delivery:** Responsive web app; online use assumed  
**Source inputs:** `KNTT_BÀI 5 - KHÚC XẠ ÁNH SÁNG.docx`; `Lesson Plan Refraction of Light (Grade 9).docx` (same 18-page lesson-plan content was returned for both files)

---

## 1. Product goal

Build an interactive 2D ray-optics simulation for Grade 9 students to investigate **refraction of light** and **total internal reflection (TIR)**. Students should change the incident angle and the refractive indices of the two transparent media, predict the outcome, run the experiment, observe the rays and angle measurements, and explain the result using evidence.

The simulation must prioritize conceptual correctness and student reasoning over decorative effects. Use a clean, colorful, student-friendly visual style with a high-contrast ray diagram.

## 2. Learning outcomes

By the end, students can:

1. Identify the incident ray, normal, boundary, reflected ray, and refracted ray.
2. Explain that angles of incidence, reflection, and refraction are measured from the **normal**, not from the boundary.
3. Use Snell's law to relate incident and refracted angles.
4. Predict whether a ray bends toward or away from the normal when it enters a medium with a higher or lower refractive index.
5. State the necessary condition for total internal reflection: light travels from a medium with a higher refractive index to one with a lower refractive index, and the incident angle exceeds the critical angle.
6. Interpret the critical-angle case correctly: at the critical angle, the refracted ray travels along the interface (refraction angle is 90° from the normal).
7. Support a prediction with the displayed angle/index values and a short explanation.

## 3. Scientific model and invariants

### 3.1 Definitions and conventions

- Medium 1 is the incident medium; medium 2 is the transmitted medium.
- `n1` and `n2` are dimensionless refractive indices.
- `i` is the incident angle from the normal.
- `r` is the refraction angle from the normal.
- `i_reflected` is the reflection angle from the normal.
- The normal is perpendicular to the interface at the point of incidence.
- Use degrees in the interface; use radians internally only if the implementation requires it.

### 3.2 Governing equations

Snell's law:

`n1 * sin(i) = n2 * sin(r)`

When a real transmitted ray exists:

`r = asin((n1 / n2) * sin(i))`

Reflection law:

`i_reflected = i`

Refractive index definition (explanatory content):

`n = c / v`

Critical angle, valid only when `n1 > n2`:

`i_c = asin(n2 / n1)`

All trigonometric calculations must use degree/radian conversions consistently. Clamp floating-point values within a small numerical tolerance before inverse-trigonometric functions; do not hide physically invalid states by arbitrary clamping.

### 3.3 State rules

1. **If `n1 < n2`:** a refracted ray exists for incident angles from 0° through 90°; the ray bends toward the normal (`r < i` for nonzero, non-grazing incidence). TIR is impossible for this direction.
2. **If `n1 = n2`:** there is no directional bending; `r = i` whenever a transmitted ray is defined. Do not report TIR.
3. **If `n1 > n2` and `i < i_c`:** show both the reflected ray and the refracted ray; the refracted ray bends away from the normal (`r > i` for nonzero incidence).
4. **If `n1 > n2` and `i = i_c` within numerical tolerance:** show the critical-angle state. The refracted ray is tangent to the interface (`r = 90°`); also show the reflected ray with reflection angle equal to incidence. Label this state “Critical angle / Góc tới hạn,” not TIR beyond the critical angle.
5. **If `n1 > n2` and `i > i_c`:** show total internal reflection; the reflected ray remains in medium 1 with reflection angle equal to incidence. Do not draw a propagating refracted ray in medium 2. Explain that TIR occurs because the required Snell-law sine value would exceed 1.
6. At exactly `i = 90°`, treat the incident ray as grazing along the interface for visualization and avoid unstable calculations. Make the boundary case explicit in the UI; do not let it produce NaN, Infinity, or a false refraction angle.
7. A reflected ray may be displayed in ordinary refraction cases too, but label the refracted ray and reflected ray distinctly. Do not imply that all incident energy is reflected unless the TIR condition is met.
8. In a simplified ray diagram, do not encode brightness/intensity quantitatively unless a physically justified reflection/transmission model is implemented and documented.

### 3.4 Representative refractive-index presets

Use these as **illustrative approximate values**, visibly identified as representative rather than universal constants. Values depend on material composition and wavelength.

- Air: 1.000
- Water: 1.333
- Acrylic / PMMA: 1.49
- Common glass (generic): 1.50

Allow the user to select Medium 1 and Medium 2 independently. Also provide a numeric refractive-index control for custom values in a reasonable educational range, e.g. 1.00–2.50, with validation and a clear reset-to-preset action. Prevent invalid, non-finite, or non-positive values. If identical materials are selected, display the no-bending case.

## 4. Learner-facing interaction design

### Main workspace

- A large 2D canvas showing two media separated by a straight interface.
- A clearly drawn normal at the point of incidence.
- Incident ray, reflected ray, and refracted ray with distinct colors and arrowheads.
- Labels for Medium 1 / Medium 2, `n1`, `n2`, `i`, `r`, reflection angle, and critical angle when applicable.
- A protractor/angle arc or equally clear angle indicators measured from the normal.
- A legend that remains visible on desktop and mobile.

### Controls

- Incident-angle slider from **0° to 90° inclusive**, step 1°; also provide keyboard-accessible increment/decrement and a numeric readout/input.
- Independent selectors for Medium 1 and Medium 2, each showing material name and refractive index.
- Custom refractive-index input/control for each medium.
- “Predict” step before “Run experiment” on the first attempt and in assigned tasks.
- “Reset” restores a known starting state without changing the selected interface language.
- “Try another case” offers guided cases: higher-to-lower index, lower-to-higher index, equal indices, below critical angle, at critical angle, above critical angle.

### Live output panel

Show:
- Current `i`, `n1`, `n2`.
- Computed `r` only when a real refracted ray exists; otherwise show “No propagating refracted ray / Không có tia khúc xạ truyền sang môi trường 2.”
- Reflection angle.
- Critical angle when `n1 > n2`; otherwise explain that no critical angle/TIR exists for the selected direction.
- Current physical state: `Refraction`, `Critical angle`, or `Total internal reflection`.
- A short, state-specific explanation with the equation used.

## 5. Pedagogical sequence

1. **Notice:** show a starter case with a ray crossing an interface.
2. **Predict:** ask students to predict the ray's direction before running the experiment.
3. **Explore:** let students change angle and material pair; update the ray diagram and measurements.
4. **Compare:** students compare cases where `n1 < n2`, `n1 = n2`, and `n1 > n2`.
5. **Discover the critical angle:** for `n1 > n2`, increase `i` to the critical angle and then above it.
6. **Explain:** ask students to use `n1 sin(i) = n2 sin(r)` and the critical-angle condition to explain the observed transition.
7. **Apply:** give a short real-world connection such as optical fibres, with no claim that the simplified diagram models all engineering details.
8. **Check understanding:** finish with 3–5 short questions and immediate explanatory feedback.

### Misconceptions to detect and correct

- Angles are measured from the boundary instead of the normal.
- Light always bends toward the normal.
- TIR occurs whenever the incident angle is large, regardless of direction.
- TIR occurs when `n1 < n2`.
- A refracted ray continues to exist above the critical angle.
- At the critical angle, the refraction angle is 0° rather than 90°.
- The reflection angle differs from the incident angle.
- Refractive index is a unit-bearing quantity.

Feedback must point to the relevant ray, angle, or equation, then allow a retry. Avoid simply marking an answer wrong.

## 6. Assessment requirements

Track within the current session:
- prediction and confidence (optional);
- selected material pair and incident angle;
- whether the prediction was correct;
- student's short explanation or selected reasoning;
- quiz results and retry count.

Do not collect personally identifying student data. Do not require account sign-in. Provide a reset/clear-session action.

## 7. Bilingual requirements

Provide Vietnamese and English, with Vietnamese as the default display language. Add a visible language switch on every screen. Switching languages must preserve current angle, material selections, prediction, experiment state, and assessment progress.

All learner-facing strings must be in a centralized dictionary, not scattered hard-coded literals. Both languages must have equivalent scientific meaning, equations, units, hints, feedback, and quiz content.

Key terminology:
- Refraction — Khúc xạ ánh sáng
- Total internal reflection — Phản xạ toàn phần
- Incident ray — Tia tới
- Reflected ray — Tia phản xạ
- Refracted ray — Tia khúc xạ
- Normal — Pháp tuyến
- Angle of incidence — Góc tới
- Angle of refraction — Góc khúc xạ
- Critical angle — Góc tới hạn
- Refractive index — Chiết suất
- Interface — Mặt phân cách

## 8. Accessibility and implementation

- Responsive layout for phones, tablets, and desktop.
- Controls must be operable by keyboard and have visible focus states.
- Do not rely on color alone: combine colors with labels, arrowheads, line styles, and a legend.
- Maintain readable contrast and avoid tiny labels on the ray diagram.
- Keep the main simulation usable without animation; provide a pause/reduced-motion behavior.
- No external API or backend is required for the core simulation. It should work as a self-contained web app after loading.
- Separate the physics calculation from rendering and UI state. Use a single source of truth for material values and calculated state.
- Guard against NaN/Infinity and numerical edge cases.
- Use clear component/state boundaries and avoid unnecessary dependencies.

## 9. Acceptance tests

All tests must pass before the prototype is considered scientifically ready.

### Test A — Normal incidence
- `n1 = 1.00`, `n2 = 1.50`, `i = 0°`.
- Expected: `r = 0°`; ray continues along the normal; no TIR.

### Test B — Refraction into higher index
- `n1 = 1.00`, `n2 = 1.50`, `i = 30°`.
- Expected: `r ≈ 19.47°`; ray bends toward the normal; no TIR.

### Test C — Refraction into lower index, below critical
- `n1 = 1.50`, `n2 = 1.00`, `i = 30°`.
- Expected: `r ≈ 48.59°`; both reflection and refraction are shown; no TIR.

### Test D — Critical angle, glass-to-air representative pair
- `n1 = 1.50`, `n2 = 1.00`.
- Expected: `i_c ≈ 41.81°`.
- At `i = i_c` within defined tolerance: show refracted ray at `90°` from the normal and label the critical-angle state.

### Test E — Above critical angle
- `n1 = 1.50`, `n2 = 1.00`, `i = 50°`.
- Expected: TIR; reflected angle `50°`; no propagating refracted ray; no invalid numeric output.

### Test F — No TIR for lower-to-higher direction
- `n1 = 1.00`, `n2 = 1.50`, `i = 60°`.
- Expected: `r ≈ 35.26°`; no TIR and no critical-angle value for this direction.

### Test G — Equal indices
- `n1 = n2 = 1.33`, `i = 40°`.
- Expected: `r = 40°`; no bending; no TIR.

### Test H — Grazing boundary
- Test `i = 90°` for both `n1 < n2` and `n1 > n2`.
- Expected: stable, explicitly labeled grazing-boundary state; no NaN/Infinity; no misleading finite angle in a TIR state.

### Test I — Control and state behavior
- Slider and numeric input stay synchronized and never exceed 0°–90°.
- Changing either medium recalculates the ray and critical angle immediately.
- Reset restores documented defaults.
- Switching languages preserves all learning state.
- Keyboard-only operation is possible.

### Test J — Pedagogy and feedback
- A student who says “TIR occurs from low index to high index” receives a targeted correction explaining the direction requirement.
- A student who measures angles from the boundary receives a hint to use the normal.
- Students can retry after feedback.
- The quiz reports a score and gives explanations, not only a score.

## 10. Source matrix and evidence

### User-provided educational source

1. **`KNTT_BÀI 5 - KHÚC XẠ ÁNH SÁNG.docx`** — read from the user's Library. It identifies Chapter II “Ánh sáng,” Lesson 5 “Khúc xạ ánh sáng,” with a two-period duration. Its stated outcomes include identifying refraction, understanding Snell's law, the refractive index, conducting/referring to experiments, and applying refraction to everyday phenomena. It includes experimental angle data (incident angles 0°, 20°, 40°, 60°, 80° and example refracted angles 0°, 13°, 25°, 35°, 41°) for a particular experimental setup. Those measured values should not be hard-coded as universal material constants.
2. **`Lesson Plan Refraction of Light (Grade 9).docx`** — read from the user's Library; returned content matches the same 18-page lesson-plan material above. Treat as a duplicate/translated-name copy unless a later comparison shows substantive differences.
3. **Attachment limitation:** the currently accessible lesson-plan source primarily covers refraction. This SPEC extends the simulation to total internal reflection using independently checked physics references; it does not claim the uploaded lesson plan itself fully teaches TIR.

### Independently checked physics references

- OpenStax, *Physics*, “16.2 Refraction”: https://openstax.org/books/physics/pages/16-2-refraction
- OpenStax, *College Physics*, “25.4 Total Internal Reflection”: https://openstax.org/books/college-physics/pages/25-4-total-internal-reflection
- Florida State University / Optical Society of America educational tutorial, “Snell’s Law, Reflection, and Refraction”: https://osa.magnet.fsu.edu/tutorials/snell.html

Core claims cross-checked: Snell's law; angles measured from the normal; the critical angle is defined by a 90° refraction angle; TIR requires `n1 > n2` and incidence above the critical angle; the reflected ray obeys equality of incidence and reflection angles.

## 11. Build instructions for Google AI Studio

Implement the complete responsive web application described by this SPEC. Treat Section 0 (simulation-first, highly interactive UI) as the highest-priority product requirement and this document as the source of truth. The result must feel like a live virtual experiment, not a text page. Do not omit direct manipulation, immediate feedback, challenge presets, trial comparison, scientific edge cases, bilingual coverage, prediction-first flow, misconception-specific feedback, or acceptance tests.

Before presenting the result:
1. Run the physics test cases in Section 9 against the calculation function.
2. Check all angle and index boundary conditions.
3. Verify Vietnamese/English equivalence and state preservation during language switching.
4. Confirm every control is functional and accessible, including ray dragging, slider synchronization, challenge presets, show/hide guides, pause/resume, and trial comparison.
5. Report any acceptance test that cannot be demonstrated; do not claim it passed without evidence.
6. Keep the app self-contained and avoid adding unrelated features.
