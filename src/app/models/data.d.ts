import { Chart } from './charts';

export interface Data {
  power: Chart;
  loadshifted: Chart;
  hydrofill: Chart;
  installed: any;
  meta: any;
  config: any;
  rules: any;
  sum: any;
}
