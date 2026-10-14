"use client";

/**
 * InstallSheet — how to put Synapse on the home screen (USE-83;
 * install-sheet/index.md). Opened at `?sheet=install` by the avatar menu's
 * "Install the app", and by the once-only offer's and the to-do sheet's How.
 *
 * Read and close: no primary, except Chrome's own "Install" when the browser
 * holds its prompt ready (browser-prompt.md). No Copy link and no second
 * person (C-USE-install-sheet-7).
 *
 * It opens on the device's tab; the other tab stays one tap away. The caller
 * passes the install state read on the device, so the sheet never guesses.
 */
import * as React from "react";
import {
  AddToHomeScreenIcon,
  Button,
  ChromeMenuIcon,
  CloseIcon,
  OpenInSafariIcon,
  ResponsiveSheet,
  SafariMoreIcon,
  SafariShareIcon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@syn/ui";
import type {
  InstallPlatform,
  InstallState,
} from "@/lib/pwa/use-install-state";
import { INSTALL_COPY as COPY } from "./copy";
import {
  InstallPillMark,
  PhoneArrowDownMark,
  SwitchOnMark,
} from "./install-marks";

export interface InstallSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  install: InstallState;
  /** Where focus goes on close when the opener (a menu row) is gone. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

const GLYPH = "size-4";

const IPHONE_GLYPHS: React.ReactNode[] = [
  <SafariMoreIcon key="more" className={GLYPH} />,
  <SafariShareIcon key="share" className={GLYPH} />,
  <AddToHomeScreenIcon key="add" className={GLYPH} />,
  <SwitchOnMark key="switch" className="h-3.5 w-6" />,
  <Text key="word" as="span" variant="caption" weight={600}>
    {COPY.addWord}
  </Text>,
];

const ANDROID_GLYPHS: React.ReactNode[] = [
  <ChromeMenuIcon key="menu" className={GLYPH} />,
  <PhoneArrowDownMark key="phone" className={GLYPH} />,
  <InstallPillMark key="pill" className="h-3.5 w-6" />,
];

function Steps({
  steps,
  glyphs,
}: {
  steps: readonly string[];
  glyphs: React.ReactNode[];
}) {
  return (
    <ol>
      {steps.map((step, index) => (
        <li
          key={step}
          className="border-hairline flex min-h-(--row-min) items-center gap-(--space-3) border-b"
        >
          {/* The list says "1 of 5"; the drawn number is not read twice. */}
          <Text
            as="span"
            variant="secondary"
            tone="muted"
            aria-hidden="true"
            className="w-(--space-4) shrink-0"
          >
            {index + 1}
          </Text>
          <span
            aria-hidden="true"
            className="border-hairline text-foreground flex size-8 shrink-0 items-center justify-center rounded-(--radius-control) border"
          >
            {glyphs[index]}
          </span>
          <Text as="span" variant="body">
            {step}
          </Text>
        </li>
      ))}
    </ol>
  );
}

export function InstallSheet({
  open,
  onOpenChange,
  install,
  returnFocusRef,
}: InstallSheetProps) {
  const [tab, setTab] = React.useState<InstallPlatform>(install.platform);
  const titleRef = React.useRef<HTMLHeadingElement>(null);

  // Each opening starts on the device's own tab, and focus on the title
  // (words-and-access.md › Focus); the sheet's frame focuses only its own.
  React.useEffect(() => {
    if (!open) return;
    setTab(install.platform);
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open, install.platform]);

  async function onInstall(): Promise<void> {
    if (install.prompt === null) return;
    try {
      const { outcome } = await install.prompt.prompt();
      // Accepted, Synapse installs and the sheet closes; dismissed, it stays.
      if (outcome === "accepted") onOpenChange(false);
    } catch {
      // The browser withdrew its prompt; the steps below still stand.
    }
  }

  const header = (
    <div className="flex min-w-0 flex-1 items-center gap-(--space-2)">
      <Button
        variant="ghost"
        size="icon"
        aria-label={COPY.close}
        onClick={() => onOpenChange(false)}
        className="-ms-(--space-3)"
      >
        <CloseIcon aria-hidden="true" />
      </Button>
      <Text
        ref={titleRef}
        as="h2"
        variant="row-title"
        weight={600}
        tabIndex={-1}
        className="outline-none"
      >
        {COPY.title}
      </Text>
    </div>
  );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={COPY.title}
      header={header}
      // The × is in the header, so the wide sheet gets no second close.
      headerAction={null}
      initialFocus="first-field"
      returnFocusRef={returnFocusRef}
      size="tall"
      classes={{
        header: "items-center pt-(--space-2)",
        body: "pt-(--space-2)",
      }}
    >
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as InstallPlatform)}
        className="gap-(--space-3)"
      >
        <TabsList className="w-full group-data-[orientation=horizontal]/tabs:h-(--target)">
          <TabsTrigger value="iphone">{COPY.tabs.iphone}</TabsTrigger>
          <TabsTrigger value="android">{COPY.tabs.android}</TabsTrigger>
        </TabsList>

        <TabsContent value="iphone" className="flex flex-col gap-(--space-2)">
          {install.notSafari ? (
            <div className="text-foreground flex items-center gap-(--space-2) py-(--space-2)">
              <OpenInSafariIcon
                aria-hidden="true"
                className="size-4 shrink-0"
              />
              <Text as="span" variant="body" weight={500}>
                {COPY.otherBrowser}
              </Text>
            </div>
          ) : null}
          <Steps steps={COPY.iphone} glyphs={IPHONE_GLYPHS} />
        </TabsContent>

        <TabsContent value="android" className="flex flex-col gap-(--space-2)">
          {install.prompt === null ? null : (
            <div className="flex flex-col gap-(--space-3) pb-(--space-2)">
              <Button
                className="w-full"
                aria-label={COPY.installLabel}
                onClick={() => void onInstall()}
              >
                {COPY.install}
              </Button>
              <Text as="p" variant="secondary" tone="muted">
                {COPY.orFromMenu}
              </Text>
            </div>
          )}
          <Steps steps={COPY.android} glyphs={ANDROID_GLYPHS} />
        </TabsContent>
      </Tabs>

      <Text as="p" variant="body" tone="muted" className="pt-(--space-4)">
        {COPY.footer}
      </Text>
    </ResponsiveSheet>
  );
}
