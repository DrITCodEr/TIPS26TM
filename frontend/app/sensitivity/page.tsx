import { StubPage } from "@/components/layout/StubPage";

export default function SensitivityPage() {
  return (
    <StubPage title="Stabilität" emoji="📈" phase={3}>
      Sensitivitätsanalyse: Variation aller 9 Gewichte um ±15/30/50 %, danach
      Box-and-Whisker-Plot der Titelchance pro Top-Team.
    </StubPage>
  );
}
