import { Chart } from './charts';
import { Rules } from './rules';
import { Installed } from './installed';
import { Config } from './config';
import { Sum } from './sum';

export interface Data {
  power: Chart;
  loadshifted: Chart;
  hydrofill: Chart;
  installed: Installed;
  meta: any;
  config: Config;
  rules: Rules;
  sum: Sum;
}
