import { Injectable } from '@angular/core';
import { SumItem } from '../models/sum';

@Injectable({
  providedIn: 'root'
})
export class SummaryService {

  constructor() { }
  calcSummary(data) {
    data.sum = {};
    for (let p = 0; p < data.power.length; p++) {
      const key = data.power[p].key;
      if (!key.startsWith('hydrofill')) {
        data.sum[key] = this.makeSum(data, p);
      }
    }
  }

  makeSum(data, p) {
    const sum: SumItem = {
      original: 0,
      modified: 0,
      deltaEnergy: 0,
      originalCo2: 0,
      modifiedCo2: 0,
      deltaCo2: 0,
      originalMoney: 0,
      modifiedMoney: 0,
      deltaMoney: 0,
      key: ''
    };
    const deltaTime = this.getResolution(data.power[p]);
    data.power[p].values.forEach((item, i) => {
      const original: number = item.y;
      const modified: number = data.loadshifted[p].values[i].y;
      const delta: number = modified - original;
      sum.key = data.power[p].key;
      sum.original += original * deltaTime;
      sum.modified += modified * deltaTime;
      sum.deltaEnergy += delta * deltaTime;
      let co2factor = 0;
      if (data.power[p] && data.config[data.power[p].originalKey]) {
        co2factor =  data.config[data.power[p].key].co2 / 1000 / 1000;
      }
      sum.modifiedCo2 += sum.modified * co2factor || 0;
      sum.originalCo2 += sum.original * co2factor || 0;
      sum.deltaCo2 += sum.deltaEnergy * co2factor || 0;
      sum.originalMoney += original * deltaTime * 40 * 1000;
      sum.modifiedMoney += modified * deltaTime * 40 * 1000;
      sum.deltaMoney += delta * deltaTime * 40 * 1000 || 0;
    });
    return sum;
  }

  getResolution(chart) {
    let deltaTime = 0.25;
    switch (chart.resolution) {
      case 'PT15M':
        deltaTime = 0.25;
        break;
      case 'PT60M':
        deltaTime = 1;
        break;
      default:
        console.error('missing resolution', chart.key, chart.resolution);
    }
    return deltaTime;
  }
}
