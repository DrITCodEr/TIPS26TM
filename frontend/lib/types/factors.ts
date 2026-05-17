export type FactorKey =
  | "elo"
  | "fifa"
  | "markt"
  | "form"
  | "heim"
  | "wmHF"
  | "trainer"
  | "star"
  | "hoehe";

export interface FactorDefinition {
  key: FactorKey;
  label: string;
  icon: string;
  max: number;
  default: number;
}

export type FactorWeights = Record<FactorKey, number>;
