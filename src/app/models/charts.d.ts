export interface Chart {
  key: string;
  originalKey: string;
  color: string;
  type: string;
  seriesIndex: number,
  values: ChartValue[];
}

interface ChartValue {
  x: number;
  y: number;
}
