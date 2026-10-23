import type { OpenWindowRequest } from "@ardia/ardiacore";
import { openWindow } from "../../lib/actions";
import { useBrowser } from "../../store/browser";
import { engineProfile } from "../../store/model";
import { isSmall, originalProfile, privateWindowProfile } from "../../store/small";
import { openLinkInSplit, openSplitPane } from "./splitActions";
import { openPeek } from "../littleArdia/actions";

export function openFromPage({ url, adoptId, disposition, profile, modifiers }: OpenWindowRequest, from: { windowId: string; profileId: string; tabId?: string }) {
  const s = useBrowser.getState();
  const w = s.windows[from.windowId];
  if (!w) return;
  if (disposition === "current") {
    if (from.tabId) s.navigate(from.tabId, url, { userInitiated: false });
    return;
  }
  if (isSmall(s, w.id) && disposition !== "window" && disposition !== "incognito") {
    return void s.newTab(w.id, { url, adoptId, openerId: from.tabId, profileId: from.profileId, background: true });
  }
  if (disposition === "split") {
    if (from.tabId) return openLinkInSplit(from.tabId, url, adoptId);
    openSplitPane(w.id, { url, adoptId });
    return;
  }
  if (disposition === "incognito") {
    const profileId = privateWindowProfile(s, w, profile);
    if (adoptId?.startsWith("tab:")) return void openWindow({ incognito: true, url, adoptId, profileId });
    return void openWindow({ incognito: true, url, profileId });
  }
  if (disposition === "peek") {
    const trigger = s.settings.peekTrigger;
    const mods = modifiers ?? {};
    const matches =
      trigger === "none" ? false :
      trigger === "shift" ? !!mods.shift :
      trigger === "alt" ? !!mods.alt :
      trigger === "ctrl" ? (!!mods.ctrl || !!mods.meta) : false;
    if (s.settings.peekEnabled && matches) {
      return void openPeek(url, from.profileId, adoptId);
    }
    // peek disabled or trigger didn't match: open as a normal window
    return void openWindow(w.incognito ? { incognito: true, url, profileId: originalProfile(s, w) } : { profileId: from.profileId, url, adoptId });
  }
  if (disposition === "window") {
    if (s.settings.peekAutoFromPinned && from.tabId && s.tabs[from.tabId]?.pinned) {
      return void openPeek(url, from.profileId, adoptId);
    }
    return void openWindow(w.incognito ? { incognito: true, url, profileId: originalProfile(s, w) } : { profileId: from.profileId, url, adoptId });
  }
  const background = disposition === "background" || from.profileId !== w.profileId;
  s.newTab(w.id, { url, adoptId, openerId: from.tabId, profileId: from.profileId, background });
}

export function pageProfileId(windowId: string, pageProfile: string): string {
  const s = useBrowser.getState();
  const w = s.windows[windowId];
  if (w && engineProfile(w.profileId) === pageProfile) return w.profileId;
  return s.profileOrder.find((p) => engineProfile(p) === pageProfile) ?? w?.profileId ?? s.settings.defaultProfileId;
}
