"use client";

import { useEffect, useState } from "react";

export function InstallHint() {
  const [state, setState] = useState<"hidden" | "ios" | "other">("hidden");

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone || !window.matchMedia("(pointer: coarse)").matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(/iPad|iPhone|iPod/.test(navigator.userAgent) ? "ios" : "other");
  }, []);

  if (state === "hidden") return null;

  return (
    <p className="mt-2 text-xs text-muted">
      {state === "ios"
        ? "Install: tap Share, then Add to Home Screen."
        : "Install: open the browser menu, then Add to Home screen."}
    </p>
  );
}
