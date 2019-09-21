import { Injectable } from '@angular/core';
import { Chart, ChartValue } from '../models/charts';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() {}
  addStorage(data) {
    if (data.hydrofill) {
      this.calcHydrofill(data);
      this.addPumped(data);
    }
    return data;
  }
  calcHydrofill(data) {
    const chart: Chart = JSON.parse(JSON.stringify(data.power[0]));
    chart.key = 'hydrofill';
    chart.originalKey = 'hydrofill';
    chart.type = 'line';
    chart.values.forEach((item, i) => {
      item.y = 0;
    });
    chart.values.forEach((item, i) => {
      item.y = this.interpolateValues(item.x, data.hydrofill.values);
    });

    data.loadshifted.push(chart);
    const clone: Chart = JSON.parse(JSON.stringify(chart));
    clone.key = 'hydrofillclone';
    clone.originalKey = 'hydrofillclone';
    data.loadshifted.push(clone);
  }
  interpolateValues(time, values) {
    let result = 0;
    for (let v = 0; v < values.length; v++) {
      const value: ChartValue = values[v];
      result = value.y;
      if (value.x > time) {
        break;
      }
    }
    return result;
  }
  addPumped(data) {
    let hydrofillclone: Chart = null;
    data.loadshifted.forEach((chart, i) => {
      if (chart.originalKey === 'hydrofillclone') {
        hydrofillclone = chart;
      }
    });
    const types: string[] = ['Hydro Pumped up', 'Hydro Pumped down', 'Hydro Water Reservoir'];
    types.forEach(type => {
      data.power.forEach((chart, i) => {
        if (chart.key === type) {
          console.log('addPumped', type);
          let total = 0;
          chart.values.forEach((item, v) => {
            const original: number = item.y;
            const modified: number = data.loadshifted[i].values[v].y;
            const delta: number = original - modified;
            if (delta ) {
              total += delta;
            }
            hydrofillclone.values[v].y += total * 1000 / 4;
          });
        }
      });
    });
  }
}
