# R167 – MarkdownSentenceField Component

**Status**: Pending  
**Type**: Feature  
**Depends On**: none  
**Description**: Create a local `MarkdownSentenceField` Vue component designed to be harvested to `spa_utils`. Used by R170 and R173.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md`

Additional input files:

- `src/components/PlanChecklistEditor.vue` — example of a local component pattern to follow.
- `src/components/PlanChecklistEditor.test.ts` — example of component unit test pattern.

## Goals

- Create `src/components/MarkdownSentenceField.vue` with:
  - Props: `modelValue: string`, `readonly: boolean`, `label?: string`.
  - **Read-only mode**: renders `modelValue` as Markdown HTML. Use whichever Markdown library is already listed in `package.json`; do not add a new dependency. If none exists, use a minimal inline renderer (bold, italic, line breaks only) and note this in Execution Notes.
  - **Edit mode**: renders a `<textarea>` that:
    - Word-wraps (`word-wrap: break-word`).
    - Auto-expands vertically to fit its content (use a `scrollHeight`-based resize approach).
    - Caps at a `max-height` of `40vh` so the card stays within a single viewport.
  - Emits `update:modelValue` on textarea input.
  - The `label` prop, when provided, renders as a `<label>` element above the field.
  - The component is free of any mentor-specific imports (no API calls, no store references).
  - Uses `data-automation-id="markdown-sentence-field"` on the root element.

### Craftsmanship Expectations

- Keep the component self-contained and import-free of mentor domain code.
- Prefer scoped `<style>` for any component-specific CSS.
- Do not duplicate styling already provided by Vuetify or `spa_utils`.

## Testing Expectations

- **Unit tests** — `npm run test`
  - `src/components/MarkdownSentenceField.test.ts` must cover:
    - Read-only mode: rendered HTML contains expected Markdown output (e.g., `**bold**` → `<strong>bold</strong>`).
    - Edit mode: a `<textarea>` element is rendered.
    - `update:modelValue` is emitted when the textarea value changes.
  - All existing tests continue to pass.

- **Build check** — `npm run build` — no type errors.

## Outputs

- `src/components/MarkdownSentenceField.vue` — **[NEW]**
- `src/components/MarkdownSentenceField.test.ts` — **[NEW]**

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
