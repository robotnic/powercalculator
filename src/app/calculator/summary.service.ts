import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SummaryService {

  constructor() { }
  calcSummary(data) {
    data.sum = {
    };
    for (let p = 0; p < data.power.length; p++) {
      const key = data.power[p].key;
      data.sum[key] = this.makeSum(data, p);
    }
    console.log('fertig', data.sum);
  }

  makeSum(data, p) {
    const sum = {
      original: 0,
      modified: 0,
      delta: 0,
    };
    const deltaTime = this.getResolution(data.power[p]);
    data.power[p].values.forEach((item, i) => {
      const original = item.y;
      const modified = data.loadshifted[p].values[i].y;
      const delta = modified - original;

      sum.original += original * deltaTime;
      sum.modified += modified * deltaTime;
      sum.delta += delta * deltaTime;
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
