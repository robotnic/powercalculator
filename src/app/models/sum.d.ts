export interface Sum {
  [index: number]: SumItem;
}
export interface SumItem {
  key: string;
  original: number;
  originalCo2: number;
  modified: number;
  modifiedCo2: number;
  deltaEnergy: number;
  deltaCo2: number;
  co2perMWh: number;
  moneyPerMWh: number;
  originalMoney: number;
  modifiedMoney: number;
  deltaMoney: number;
}