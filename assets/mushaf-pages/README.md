# Mushaf Page Asset Contract

This directory is intentionally reserved for self-hosted Mushaf page scans.

## Supported Naming

- Preferred: `1.png` through `604.png` (non-padded).
- Also supported: `001.png` through `604.png` (zero-padded).
- Primary extension is configurable (default `webp`), and fallback extension is `png`.

## Runtime Lookup

The app resolves pages from:

- Primary: `assets/mushaf-pages/{page}.webp`
- Fallback: `assets/mushaf-pages/{page}.png`

Where `{page}` is either `1..604` or `001..604`.

## Notes

- Do not commit assets unless the source license permits redistribution.
- Keep image dimensions consistent across pages for smoother zoom and navigation.
