import Link from "next/link";
import { InfoBanner } from "@/components/ui/InfoBanner";

export function EmptyResult({
  what = "Noch keine Simulation gestartet.",
}: {
  what?: string;
}) {
  return (
    <InfoBanner icon="!">
      <strong>{what}</strong> Gehe zu{" "}
      <Link
        href="/setup"
        className="underline font-bold"
        style={{ color: "var(--mint)" }}
      >
        Setup
      </Link>{" "}
      und starte die Simulation, um die Wahrscheinlichkeiten zu sehen.
    </InfoBanner>
  );
}
