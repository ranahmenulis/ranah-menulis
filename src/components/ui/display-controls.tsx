"use client";

import { LanguageMenu } from "./language-menu";
import { PreferencesMenu } from "./preferences-menu";
import { ThemeToggle } from "./theme-toggle";

/** Language and theme buttons: separate from md up, one combined menu on narrow screens. */
export function DisplayControls() {
  return (
    <>
      <div className="flex items-center max-md:hidden">
        <LanguageMenu />
        <ThemeToggle />
      </div>
      <PreferencesMenu className="md:hidden" />
    </>
  );
}
