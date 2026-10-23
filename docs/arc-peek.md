# Arc Peek (link preview) — design

Status: in progress. Branch `feat/arc-peek`.

## Goal

Open a link in a floating, interactable preview instead of (or in addition to) a
tab, so a reference can be checked without cluttering the tab bar. Dismiss by
clicking outside or pressing Esc; promote to a real tab with the existing
"Open in Ardia" action (and split, in a later stage).

## Arc's behavior (target)

- Auto-Peek: clicking a link in a Pinned or Favorite tab opens it in Peek.
- Manual: Shift+click a link from any tab opens it in Peek.
- Window: floating preview over the current page, real browser tab.
- Controls: Close (X / Cmd-W / click outside), Expand to tab (Cmd-O), Split.
- Setting: Links → toggle "Open a Peek window when clicking on links to other
  sites"; turn off both auto and manual → always new tabs.
- 5-second hover preview (Arc Max) is a separate feature and out of scope here.

## Implementation strategy

Reuse Little Ardia's small window (a real Chrome tab in an NSWindow) rather
than building a new floating panel. Little Ardia already provides profile
routing, remembered size, Cmd-O promote, Esc close, and external-link routing.

- v1 (this branch, JS only): `openPeek(url, profileId)` entry point, an
  `openInPeek` command, and settings `peekEnabled`, `peekTrigger`,
  `peekAutoFromPinned`. Testable without an engine build.
- v2 (engine): Shift+click and configurable-trigger interception in
  `ac_browser.mm`, plus auto-Peek from pinned tabs. Requires a Chromium build.
- v3 (polish): click-anchored positioning, split button, stacked Peeks, hover
  preview.

## Entry points

- `openPeek(url?, profileId?, adoptId?)` in
  `apps/browser/src/components/littleArdia/actions.ts`
- command `openInPeek` in `apps/browser/src/lib/commands.ts`
- settings in `apps/browser/src/store/settings.ts`
