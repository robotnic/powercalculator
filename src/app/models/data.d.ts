import { Chart } from './charts';
import { Rules } from './rules';
import { Installed } from './installed';
import { Consumption } from './consumption';
import { Config } from './config';
import { SumItem } from './sum';
import { Meta } from './meta';

export interface Data {
  power: Chart[];
  loadshifted: Chart[];
  hydrofill: Chart;
  installed: Installed;
  consumption: Consumption;
  meta: Meta;
  config: Config;
  rules: Rules;
  sum: Sum;
}
interface Sum {
  electricity: SumObj;
  energy: SumObj;
}
interface SumObj {
  key: string;
  items: SumItem[],
  totals: Total
}
interface Total {
  [key: string]: number;
}