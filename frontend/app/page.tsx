import { StubPage } from "@/components/layout/StubPage";

export default function HomePage() {
  return (
    <StubPage title="Übersicht & Methodik" emoji="🏠" phase={3}>
      <p className="mb-3">
        Hier landest Du beim Start der App: Eröffnungs-Hero,
        Turnier-Statistiken, alle 12 Gruppen auf einen Blick und eine kurze
        Erklärung des TIPS-26-Modells (Maher 1982, Dixon-Coles 1997, Groll
        et al. 2019).
      </p>
      <p style={{ color: "var(--text-tertiary)" }} className="text-xs">
        Skelett aus Phase 1 steht. Inhalte kommen in Phase 3.
      </p>
    </StubPage>
  );
}
