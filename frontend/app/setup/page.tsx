import { SectionTitle } from "@/components/ui/Card";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { AlgorithmSwitcher } from "@/components/setup/AlgorithmSwitcher";
import { Presets } from "@/components/setup/Presets";
import { FactorSliders } from "@/components/setup/FactorSliders";
import { SimDepthSlider } from "@/components/setup/SimDepthSlider";
import { SurpriseSlider } from "@/components/setup/SurpriseSlider";
import { OverdispersionSlider } from "@/components/setup/OverdispersionSlider";
import { DfbCheatToggle } from "@/components/setup/DfbCheatToggle";
import { RunSimulationButton } from "@/components/setup/RunSimulationButton";

export default function SetupPage() {
  return (
    <section>
      <InfoBanner icon="⚙">
        <strong>9 Faktoren bestimmen die Vorhersage.</strong> Bewege die Slider,
        um zu steuern, wie wichtig jeder Faktor sein soll.
      </InfoBanner>

      <SectionTitle>🧮 Algorithmus</SectionTitle>
      <AlgorithmSwitcher />

      <SectionTitle>🎯 Voreinstellungen</SectionTitle>
      <Presets />

      <SectionTitle>🎚️ Gewichtungen</SectionTitle>
      <FactorSliders />

      <SectionTitle>🎲 Simulations-Tiefe</SectionTitle>
      <SimDepthSlider />

      <SectionTitle>🎰 Überraschungs-Faktor</SectionTitle>
      <SurpriseSlider />

      <SectionTitle>⚡ Tor-Streuung</SectionTitle>
      <OverdispersionSlider />

      <SectionTitle>🎉 Spaß-Modus</SectionTitle>
      <DfbCheatToggle />

      <RunSimulationButton />
    </section>
  );
}
