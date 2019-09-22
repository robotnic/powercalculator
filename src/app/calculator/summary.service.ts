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
      delta: 0,
      co2: 0
    };
    const deltaTime = this.getResolution(data.power[p]);
    data.power[p].values.forEach((item, i) => {
      const original: number = item.y;
      const modified: number = data.loadshifted[p].values[i].y;
      const delta: number = modified - original;

      sum.original += original * deltaTime;
      sum.modified += modified * deltaTime;
      sum.delta += delta * deltaTime;
      if (data.power[p] && data.config[data.power[p].originalKey]) {
        sum.co2 += delta * deltaTime * data.config[data.power[p].key].co2;
      }
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
        console.error('missing resolution', chart.resolution);
    }
    return deltaTime;
  }
}
