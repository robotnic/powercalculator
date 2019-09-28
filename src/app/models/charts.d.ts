export interface Chart {
  key: string;
  originalKey: string;
  color: string;
  yAxis: string;
  type: string;
  source: string;
  seriesIndex: number,
  disabled: boolean,
  values: ChartValue[];
}

interface ChartValue {
  x: number;
  y: number;
}
