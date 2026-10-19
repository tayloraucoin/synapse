"use client";

import * as React from "react";

import { useRunningTimer } from "@/lib/stores/use-timer-store";

/**
 * The browser tab's title on the board (Workflow UX v0.1 §3.4, #W12) —
 * *Next: {title} — Synapse*, *Everything is firing — Synapse*, or *Workflow —
 * Synapse*. The board is usually behind another window; the tab strip is the
 * one place it can still answer *which one now*.
 *
 * A RUNNING HABIT TIMER WINS (TD-44): it is the older promise, and the shell's
 * `TimerTitle` owns the title while one runs — the board writes nothing then.
 * When the timer stops, the shell restores its saved title in its own effect,
 * after this one (a parent's effects follow its children's), so the board
 * writes on the next task and again whenever the head changes under it.
 *
 * On leaving the board the title it found is put back.
 */
export function WorkflowTitle({ title }: { title: string }) {
  const running = useRunningTimer();
  const timerRunning = running !== null;

  React.useEffect(() => {
    const found = document.title;
    return () => {
      document.title = found;
    };
  }, []);

  React.useEffect(() => {
    if (timerRunning) return;
    const write = () => {
      if (document.title !== title) document.title = title;
    };
    const handle = window.setTimeout(write, 0);
    // Next streams the page's metadata `<title>` in after hydration, and the
    // shell restores its own on a timer's stop: whoever writes the head last
    // wins, so the board re-asserts its title whenever the head changes.
    const observer = new MutationObserver(write);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => {
      window.clearTimeout(handle);
      observer.disconnect();
    };
  }, [title, timerRunning]);

  return null;
}
