import type { ReactNode } from "react";
import { StatusBar } from "./StatusBar";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { LoadingOverlay } from "@/components/loading/LoadingOverlay";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <div className="zigzag-bg" />
      <StatusBar />
      <AppHeader />
      <div className="scroll-container">{children}</div>
      <BottomNav />
      <LoadingOverlay />
    </div>
  );
}
