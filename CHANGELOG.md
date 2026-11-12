# Changelog

All notable changes to `spin-wheel-game` are listed here, newest first. Versions follow [semantic versioning](https://semver.org/).

## [Unreleased]

### Added
- A Sponsor button on the demo site and in the README, a GitHub `FUNDING.yml`, and a `funding` field in `package.json` so npm shows a "Fund" link.

## [1.5.0] - 2026-11-10

### Added
- `clickToSpin` prop: `'wheel'` (default), `'button'` (only the center button spins) or `'none'`.
- `spin()` method through a ref (`ISpinWheelHandle`), to start a spin from your own button.
- Accessibility: the canvas has a role and a label listing the segments, can be focused and spun with Enter or Space, and the result is announced through an `aria-live` region.

### Changed
- The tick sound is now synthesized instead of an mp3, so every segment gets its own tick (it used to restart one clip) and the bundle shrinks from 40 kB to 8 kB. The tick is a dry wood click.

### Fixed
- The wheel is now sharp on Retina and other high-density screens. The canvas draws at the screen's pixel ratio (up to 3x) and redraws when the window moves to a screen with a different ratio.
- Long segment labels are no longer cut off at 21 characters. A label that does not fit now ends with an ellipsis ("…") instead.
- The label font, center button and needle now scale with `size`, so small and large wheels look the same as the default one.
- With `arrowLocation="top"`, the needle is shorter and no longer covers the label of the segment it points at.

## [1.4.0] - 2026-11-04

### Added
- The demo site now has a props playground, the full docs, these release notes and links to star the repo.

### Changed
- The wheel now lands on a random segment. Every spin used to travel almost the same distance, so a wheel kept landing on the same segment. Spins can be up to about 35% faster than before.
- `react` is now a peer dependency (`>=18`) instead of a dependency, which avoids duplicate copies of React in your app.
- `package.json` now has `types`, `module` and `exports`, so TypeScript finds the bundled typings.
- The npm description, keywords and homepage now describe the package (React, prize wheel, wheel of fortune, giveaways, raffles), so it is easier to find. `homepage` points at the demo site.
- Removed the `engines.node` restriction (it applied to people installing the package). Node 24 is still used for development.

### Fixed
- Segment text and colors could drift out of sync when a segment had no `segColor` or an empty `segmentText`. Segments without a color now use `primaryColor`.
- A wheel with fewer than 2 segments (or `undefined` segments) no longer breaks. It renders nothing and logs a console warning.
- `size`, `upDuration` and `downDuration` values that are `NaN`, negative or zero where that makes no sense now fall back to their defaults. Before, `downDuration={0}` broke the wheel permanently.
- Emptying the segments mid-spin stops the spin instead of calling `onFinished` with `undefined`.

## [1.3.1] - 2026-11-03

### Changed
- Republished so the npm page shows the updated README and live demo link.

## [1.3.0] - 2026-11-03

### Added
- `responsive` prop (default `true`). The wheel shrinks to fit its container, for example on phones, and never grows past `size`. Set `responsive={false}` for the old fixed pixel size.

## [1.2.1] - 2026-11-03

### Fixed
- The ES bundle failed to load as a native module because React's JSX runtime was bundled into it. `react/jsx-runtime` is now external, and the bundle shrank from 57 kB to 39 kB.

## [1.2.0] - 2026-11-03

### Changed
- Documented that React 18 or newer is required, and the real `arrowLocation` default (`'center'`).
- Development tooling moved to Node 24, Vite 8 and ESLint flat config.

### Fixed
- Spin state (angle, timer, canvas) lives in refs, so it survives re-renders.
- The wheel redraws when props change (segments, colors, size, fonts and so on).
- The spin timer and sound are cleaned up when the component unmounts.
- Multiple wheels can be on one page (the hard-coded canvas ids are gone).
- The spin sound plays on every spin, not just the first.
- The full canvas is cleared on each frame, and a `fillStyle` typo is fixed.
- The audio element is created on mount instead of at import time, so server-side rendering no longer crashes.

## [1.0.3-alpha.3] - 2024-06-12

### Added
- `CONTRIBUTING.md` and a Contributing section in the README.

### Changed
- First release published under the plain name `spin-wheel-game` on npm. The package config used to point at GitHub Packages as `@ajay-maury/spin-wheel-game`.

[Unreleased]: https://github.com/Ajay-Maury/spin-wheel-game/compare/v1.5.0...HEAD
[1.5.0]: https://github.com/Ajay-Maury/spin-wheel-game/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/Ajay-Maury/spin-wheel-game/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/Ajay-Maury/spin-wheel-game/releases/tag/v1.3.1
[1.3.0]: https://github.com/Ajay-Maury/spin-wheel-game/commit/e15d796
[1.2.1]: https://github.com/Ajay-Maury/spin-wheel-game/commit/8c28743
[1.2.0]: https://github.com/Ajay-Maury/spin-wheel-game/commit/340625b
[1.0.3-alpha.3]: https://github.com/Ajay-Maury/spin-wheel-game/commit/512249e
