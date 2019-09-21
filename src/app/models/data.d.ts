import { Chart } from './charts';
import { Rules } from './rules';
import { Installed } from './installed';
import { Config } from './config';
import { Sum } from './sum';
import { Meta } from './meta';

export interface Data {
  power: Chart;
  loadshifted: Chart;
  hydrofill: Chart;
  installed: Installed;
  meta: Meta;
  config: Config;
  rules: Rules;
  sum: Sum;
}
