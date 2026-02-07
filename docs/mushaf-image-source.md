# Mushaf Image Source and Licensing

This project uses a self-hosted Mushaf image pipeline and does **not** depend on the GPL-licensed `QuranHub/quran-pages-images` repository.

## Policy

- Only use a source with explicit terms compatible with this project.
- Keep a copy of the source license and attribution requirements in this folder if required by the provider.
- Verify redistribution rights before publishing image assets.

## Asset Contract

- Folder in repo: `/assets/mushaf-pages`
- Runtime URL base (default): `assets/mushaf-pages`
- Filenames supported:
  - `1.png` through `604.png` (preferred)
  - `001.png` through `604.png` (also supported)
- Optional primary format: `webp` (same naming patterns)

## App Behavior

- Image-first rendering for page mode (Browse/Reveal in Mushaf mode).
- If an image is missing:
  - Show a non-blocking warning.
  - Use text fallback when `ENABLE_TEXT_PAGE_FALLBACK` is `true`.

## Integration Constants

Configured in `/script.js`:

- `MUSHAF_IMAGE_BASE`
- `MUSHAF_IMAGE_EXT`
- `MUSHAF_IMAGE_FALLBACK_EXT`
- `ENABLE_TEXT_PAGE_FALLBACK`
